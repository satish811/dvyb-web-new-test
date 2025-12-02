import { klingService } from "../../../services";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).json({ message: "OK" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required",
      });
    }

    console.log(`📊 Checking status for task: ${taskId}`);

    const response = await klingService.get(`/videos/image2video/${taskId}`);
    const data = response.data;

    let status = "processing";
    let progress = 0;
    let videoUrl = null;

    switch (data.task_status) {
      case "succeed":
        status = "completed";
        progress = 100;
        videoUrl = data.task_result?.videos?.[0]?.url;
        break;
      case "failed":
        status = "failed";
        break;
      case "processing":
        status = "processing";
        progress = 50;
        break;
      case "submitted":
        status = "processing";
        progress = 10;
        break;
      default:
        status = "processing";
        progress = 25;
    }

    const statusData = {
      status,
      progress,
      videoUrl,
      rawStatus: data.task_status,
      ...(status === "failed" && {
        error: data.task_status_msg || "Video generation failed",
      }),
    };

    return res.status(200).json({
      success: true,
      data: statusData,
    });
  } catch (error) {
    console.error("❌ Status check error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
