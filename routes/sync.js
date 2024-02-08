import express from 'express';
import { syncOpendiggerHandler } from '../controllers/opendigger.js';
import { syncCompassHandler } from '../controllers/compass.js';
import { syncProjectHandler } from '../controllers/sync.js';
import { syncDownloadCount, syncWeekOfMonth } from '../controllers/downloadCount.js';
import { syncScorecardHandler } from '../controllers/scorecard.js';
import { syncPackageSize, syncGitHubProjectPackageSize } from '../controllers/packageSize.js';

const router = express.Router();

/**
 * @swagger
 * /sync/compass:
 *   post:
 *     summary: Synchronize Compass
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: The created data.
 */
router.route('/compass').post(syncCompassHandler);

/**
 * @swagger
 * /sync/opendigger:
 *   post:
 *     summary: Synchronize Opendigger
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: success.
 */
router.route('/opendigger').post(syncOpendiggerHandler);

/**
 * @swagger
 * /sync/{projecId}:
 *   post:
 *     summary: Synchronize a single project
 *     parameters:
 *       - in: path
 *         name: projecId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: success.
 */
router.route('/:projecId').post(syncProjectHandler);

/**
 * @swagger
 * /syncWeekOfMonth:
 *   post:
 *     summary: 获取week of month数据
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start:
 *                 type: string
 *                 example: "2017-01-01"
 *               end:
 *                 example: "2037-12-31"
 *     responses:
 *       200:
 *         description: The created book.
 *
 */
router.route('/syncWeekOfMonth').post(syncWeekOfMonth);

/**
 * @swagger
 * /syncDownloadCount:
 *   post:
 *     summary: 获取downloadCount数据
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 example: "2017-01-01"
 *               projectId:
 *                 type: int
 *                 example: 1
 *     responses:
 *       200:
 *         description: The created book.
 *
 */
router.route('/npmdownloads').post(syncDownloadCount);

/**
 * @swagger
 * /sync/scorecard:
 *   post:
 *     summary: 获取Scorecard数据
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       
 */
router.route('/scorecard').post(syncScorecardHandler);

/**
 * @swagger
 * /syncPackagesize:
 *   post:
 *     summary: 获取单个项目包大小数据
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               version:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created data.
 */
router.route('/syncPackagesize').post(syncPackageSize);

/**
 * @swagger
 * /syncGitHubProjectPackageSize:
 *   post:
 *     summary: 获取所有Github项目包大小数据
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: The created data.
 */
router.route('/syncGitHubProjectPackageSize').post(syncGitHubProjectPackageSize);

export default router;
