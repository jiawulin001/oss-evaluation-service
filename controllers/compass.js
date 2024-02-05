import {request, gql} from "graphql-request";
import {CompassActivity} from "../models/CompassActivity.js";
import {GithubProjects} from "../models/GithubProjects.js";
import debug from "debug";

const query = gql`
    query MetricActivity($label: String!, $level: String, $beginDate: ISO8601DateTime, $endDate: ISO8601DateTime) {
      metricActivity(label: $label, level: $level, beginDate: $beginDate, endDate: $endDate) {
        activeC1IssueCommentsContributorCount
        activeC1IssueCreateContributorCount
        activeC1PrCommentsContributorCount
        activeC1PrCreateContributorCount
        activeC2ContributorCount
        activityScore
        closedIssuesCount
        codeReviewCount
        commentFrequency
        commitFrequency
        contributorCount
        createdSince
        grimoireCreationDate
        label
        level
        orgCount
        recentReleasesCount
        shortCode
        type
        updatedIssuesCount
        updatedSince
      }
    }
  `;

/**
 *
 * @param req 请求体
 * @param res 响应
 * @param next
 * @returns {Promise<void>} compass 活跃度数据数组(从近及远)
 */
export async function getMetricActivity(req, res, next) {
    const data = await request(
        "https://oss-compass.org/api/graphql",
        query,
        req.body
    );
    res.status(200).json(data);
}

/**
 *  同步compass数据
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
export async function syncMetricActivity(req, res, next) {
    debug.log('compass数据集成启动');
    // 1. 获取数据库中的 github 项目
    const projectNumber = await GithubProjects.count();
    const Page = 100;
    let begin = 0;
    for (begin; begin < projectNumber; begin += Page) {
        // 获取 github project 信息
        let projectsList = await GithubProjects.findAll({
            attributes: ['id', 'htmlUrl'],
            offset: begin,
            limit: Page
        });

        let compassActivityMetricList = [];

        for (const item of projectsList) {
            let project = item.dataValues;
            let data = await request(
                "https://oss-compass.org/api/graphql",
                query,
                {
                    label: project.htmlUrl
                }
            );
            let metric = data.metricActivity.reverse();
            if (metric.length === 0) {
                debug.log('项目: ', project.htmlUrl, ' 不存在 compass 活跃度数据');
                continue;
            }
            for (let item in metric) {
                let activity = metric[item];
                compassActivityMetricList.push(new CompassActivityMetricDto(
                    project.id,
                    activity.label,
                    activity.closedIssuesCount,
                    activity.commentFrequency,
                    activity.commitFrequency,
                    activity.codeReviewCount,
                    activity.updatedIssuesCount,
                    activity.recentReleasesCount,
                    activity.contributorCount,
                    activity.orgCount,
                    activity.grimoireCreationDate
                ));
                if (compassActivityMetricList.length === 5) {
                    break;
                }
            }
        }
        // 批量集成
        await bulkInsertCompassData(compassActivityMetricList);
        debug.log('compass插入了: ', projectsList.length, ' 个project的数据')
    }

    res.status(200).data('数据集成完毕');
}


/**
 * Compass 实体类数据
 */
class CompassActivityMetricDto {
    constructor(
        projectId,
        label,
        closedIssuesCount,
        commentFrequency,
        commitFrequency,
        codeReviewCount,
        updatedIssuesCount,
        recentReleasesCount,
        contributorCount,
        orgCount,
        grimoireCreationDate
    ) {
        this.id = 0;
        this.projectId = projectId;
        this.label = label;
        this.closedIssuesCount = closedIssuesCount;
        this.commentFrequency = commentFrequency;
        this.commitFrequency = commitFrequency;
        this.codeReviewCount = codeReviewCount;
        this.updatedIssuesCount = updatedIssuesCount;
        this.recentReleasesCount = recentReleasesCount;
        this.contributorCount = contributorCount;
        this.orgCount = orgCount;
        this.grimoireCreationDate = grimoireCreationDate;
    }
}

/**
 * 批量插入数据
 * @param compassMetricList
 * @returns {Promise<void>}
 */
async function bulkInsertCompassData(compassMetricList) {
    CompassActivity.bulkCreate(compassMetricList).then(compass => {
            console.log('批量插入了数据: ', compass);
        }
    ).catch(err => {
        console.log('批量插入失败: ', err);
    })
}