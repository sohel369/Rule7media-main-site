import express from'express';
const router = express.Router();
import {upload} from "../middlewares/multer.middleware.js"
import { getStatistics,getStatisticsByCountry,createStatistic,updateStatistic,deleteStatistic, } from "../controllers/statistics.controller.js";

router.get('/', getStatistics);
router.get('/:country/', getStatisticsByCountry);
router.post('/', upload.array('videos'), createStatistic);
router.patch('/:id', upload.array('videos'), updateStatistic);
router.delete('/:id', deleteStatistic);

export default router; 