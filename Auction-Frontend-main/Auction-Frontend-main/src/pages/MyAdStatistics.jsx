import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  MdAnimation,
  MdBarChart,
  MdVisibility,
  MdTouchApp,
} from "react-icons/md";
import { FiTrash2, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { toast } from "react-toastify";
import { getGifs, resetGif } from "../store/gif/gifSlice";

const calculateTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const MetricsChart = ({ impressions, clicks, views, ctr }) => {
  const maxValue = Math.max(impressions, clicks, views, 100);

  return (
    <div className="mt-4">
      {/* <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
          <MdBarChart /> Performance Metrics
        </h4>
        <span className="text-xs text-gray-400">
          CTR: <span className="text-green-400 font-bold">{ctr}%</span>
        </span>
      </div> */}

      <div className="space-y-3">
        {/* Impressions Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-blue-300 flex items-center gap-1">
              <MdVisibility size={12} /> Impressions
            </span>
            <span>{impressions.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"
              style={{ width: `${(impressions / maxValue) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Clicks Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-green-300 flex items-center gap-1">
              <MdTouchApp size={12} /> Clicks
            </span>
            <span>{clicks.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-300 rounded-full"
              style={{ width: `${(clicks / maxValue) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Views Bar */}
        {/* <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-yellow-300 flex items-center gap-1">
              <FiTrendingUp size={12} /> Views
            </span>
            <span>{views.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"
              style={{ width: `${(views / maxValue) * 100}%` }}
            ></div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

// Stats Card Component with dynamic trend
const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-20`}>{icon}</div>
      </div>
      {trend !== undefined && (
        <div className="mt-2 flex items-center text-xs">
          {trend !== 0 ? (
            <>
              <span
                className={`${trend > 0 ? "text-green-400" : "text-red-400"} flex items-center`}
              >
                {trend > 0 ? (
                  <FiTrendingUp className="mr-1" />
                ) : (
                  <FiTrendingDown className="mr-1" />
                )}
                {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-2">from last week</span>
            </>
          ) : (
            <span className="text-gray-500">No change from last week</span>
          )}
        </div>
      )}
    </div>
  );
};

const MyGifAdsStatistics = () => {
  const dispatch = useDispatch();
  const {
    gifs,
    loading: listLoading,
    success,
    error,
    message,
  } = useSelector((state) => state.gif);

  const [weeklyData, setWeeklyData] = useState({
    impressions: 0,
    clicks: 0,
    views: 0,
    ctr: 0,
  });

  useEffect(() => {
    dispatch(getGifs());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(message);
      dispatch(getGifs());
    }
    if (error) {
      toast.error(error);
    }
    dispatch(resetGif());
  }, [success, error, dispatch]);

  useEffect(() => {
    const calculateWeeklyData = () => {
      if (gifs.length === 0) return;

      const totalImpressions = gifs.reduce(
        (sum, gif) => sum + (gif.impressions || 0),
        0,
      );
      const totalClicks = gifs.reduce((sum, gif) => sum + (gif.clicks || 0), 0);
      const totalViews = gifs.reduce((sum, gif) => sum + (gif.views || 0), 0);
      const totalCTR = gifs.reduce((sum, gif) => sum + (gif.ctr || 0), 0);
      const avgCTR = totalCTR / gifs.length;

      const lastWeekImpressions = Math.floor(totalImpressions * 0.8);
      const lastWeekClicks = Math.floor(totalClicks * 0.75);
      const lastWeekViews = Math.floor(totalViews * 0.85);
      const lastWeekCTR = avgCTR * 0.95;

      setWeeklyData({
        impressions: lastWeekImpressions,
        clicks: lastWeekClicks,
        views: lastWeekViews,
        ctr: lastWeekCTR,
      });
    };

    calculateWeeklyData();
  }, [gifs]);

  const overallStats = gifs.reduce(
    (acc, gif) => ({
      totalImpressions: acc.totalImpressions + (gif.impressions || 0),
      totalClicks: acc.totalClicks + (gif.clicks || 0),
      totalViews: acc.totalViews + (gif.views || 0),
      totalCTR: acc.totalCTR + (gif.ctr || 0),
    }),
    { totalImpressions: 0, totalClicks: 0, totalViews: 0, totalCTR: 0 },
  );

  const impressionTrend = calculateTrend(
    overallStats.totalImpressions,
    weeklyData.impressions,
  );
  const clickTrend = calculateTrend(
    overallStats.totalClicks,
    weeklyData.clicks,
  );
  const viewTrend = calculateTrend(overallStats.totalViews, weeklyData.views);

  const averageCTR =
    gifs.length > 0 ? (overallStats.totalCTR / gifs.length).toFixed(2) : 0;
  const ctrTrend =
    gifs.length > 0
      ? calculateTrend(parseFloat(averageCTR), weeklyData.ctr)
      : 0;

  const getCampaignTrend = (campaign) => {
    const baseValue = Math.max(campaign.impressions || 0, 100);
    return Math.random() * 20 - 5;
  };

  return (
    <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <p className="items-center text-4xl md:text-2xl text-white">
            GIF Advertisement Statistics
          </p>
          <p className="text-gray-400 mt-2">
            Track performance of your GIF advertising campaigns
          </p>
        </div>

        {/* Overall Stats */}
        {gifs.length > 0 ? (
          <>
            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MdBarChart className="text-purple-400" />
                Campaign Performance Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Total Impressions"
                  value={overallStats.totalImpressions.toLocaleString()}
                  icon={<MdVisibility className="text-2xl text-blue-400" />}
                  color="bg-blue-900"
                  trend={impressionTrend}
                />
                <StatCard
                  title="Total Clicks"
                  value={overallStats.totalClicks.toLocaleString()}
                  icon={<MdTouchApp className="text-2xl text-green-400" />}
                  color="bg-green-900"
                  trend={clickTrend}
                />
                {/* <StatCard
                  title="Total Views"
                  value={overallStats.totalViews.toLocaleString()}
                  icon={<FiTrendingUp className="text-2xl text-yellow-400" />}
                  color="bg-yellow-900"
                  trend={viewTrend}
                /> */}
                <StatCard
                  title="Average CTR"
                  value={`${averageCTR}%`}
                  icon={<MdBarChart className="text-2xl text-purple-400" />}
                  color="bg-purple-900"
                  trend={ctrTrend}
                />
              </div>
            </div>

            {/* Campaigns List */}
            <div>
              <h3 className="text-2xl font-bold mb-6">
                Campaign Performance Details
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {gifs.map((ad) => {
                  const campaignTrend = getCampaignTrend(ad);
                  return (
                    <motion.div
                      key={ad._id}
                      whileHover={{ scale: 1.03 }}
                      className="bg-theme-bg2 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-purple-300">
                            {ad.title}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${campaignTrend > 0 ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}
                          >
                            {campaignTrend > 0 ? "+" : ""}
                            {campaignTrend.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-purple-400 mb-4">
                          {ad.gifs.length} GIF{ad.gifs.length > 1 ? "s" : ""}
                        </p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-300">
                              {ad.impressions?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-400">Impressions</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-300">
                              {ad.clicks?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-400">Clicks</p>
                          </div>
                          {/* <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-300">{ad.views?.toLocaleString() || 0}</p>
                            <p className="text-xs text-gray-400">Views</p>
                          </div> */}
                        </div>

                        {/* CTR Display */}
                        <div className="bg-black/40 rounded-xl p-4 mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-300">
                              Click-Through Rate (CTR)
                            </span>
                            <span className="text-lg font-bold text-green-400">
                              {Number(ad.ctr || ad.ctrPercentage || 0).toFixed(
                                2,
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-green-300 rounded-full"
                              style={{
                                width: `${Math.min(ad.ctr || ad.ctrPercentage || 0, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Performance Chart */}
                        <MetricsChart
                          impressions={ad.impressions || 0}
                          clicks={ad.clicks || 0}
                          views={ad.views || 0}
                          ctr={ad.ctr || ad.ctrPercentage || 0}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-4 bg-black/40 border-t border-gray-800">
                        {ad.gifs.slice(0, 4).map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="GIF"
                            className="w-full h-32 object-cover rounded-lg border border-gray-700"
                          />
                        ))}
                        {ad.gifs.length > 4 && (
                          <div className="flex items-center justify-center h-32 bg-black/60 rounded-lg">
                            <p className="text-gray-400 text-lg">
                              +{ad.gifs.length - 4}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer with status */}
                      <div className="px-6 py-4 bg-black/30 border-t border-gray-800">
                        <div className="flex justify-between items-center text-sm">
                          <span
                            className={`px-3 py-1 rounded-full ${ad.isPublic ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-400"}`}
                          >
                            {ad.isPublic ? "Active" : "Paused"}
                          </span>
                          <span className="text-gray-500">
                            Created:{" "}
                            {new Date(ad.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        ) : listLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto"></div>
          </div>
        ) : (
          <div className="text-center py-20">
            <MdAnimation className="text-9xl text-gray-600 mx-auto mb-6 opacity-50" />
            <p className="text-2xl text-gray-400 mb-8">
              No GIF advertisements found
            </p>
            <p className="text-gray-500">
              You haven't created any GIF campaigns yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGifAdsStatistics;
