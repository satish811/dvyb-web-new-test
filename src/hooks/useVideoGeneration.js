// src/components/b2c/TryOn/hooks/useVideoGeneration.js

import { useState } from "react";
import { API_ENDPOINTS, TIMINGS } from "../utils/tryOnConstants";
import { createVideoFormData } from "../utils/tryOnHelpers";

/**
 * 3D Video Generation Logic Hook
 * Handles video generation and polling for completion
 */
export const useVideoGeneration = (videoSourceImage) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoTaskId, setVideoTaskId] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState('');
  const [videoStatus, setVideoStatus] = useState("");

  /**
   * Poll video status until completion
   * Checks every 5 seconds for up to 5 minutes
   */
  const pollVideoStatus = async (taskId) => {
    const maxAttempts = TIMINGS.MAX_VIDEO_ATTEMPTS; // 60 attempts
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.VIDEO_STATUS}/${taskId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        // Update progress
        setVideoProgress(result.progress || 0);
        setVideoStatus(result.status || "Processing");

        if (result.status === 'Success') {
          // Video generation complete - get download URL
          const downloadResponse = await fetch(`${API_ENDPOINTS.VIDEO_DOWNLOAD}/${result.file_id}`);
          const downloadData = await downloadResponse.json();

          if (downloadData.success) {
            setVideoUrl(downloadData.videoUrl);
            setIsGeneratingVideo(false);
            console.log('✅ Video generated successfully!');
          }
          return;
        } else if (result.status === 'Fail') {
          setVideoError('Video generation failed');
          setIsGeneratingVideo(false);
          return;
        } else if (attempts < maxAttempts) {
          // Still processing - check again in 5 seconds
          attempts++;
          setTimeout(checkStatus, TIMINGS.VIDEO_POLL_INTERVAL);
        } else {
          // Timeout after 5 minutes
          setVideoError('Video generation timed out');
          setIsGeneratingVideo(false);
        }
      } catch (err) {
        console.error('Status check error:', err);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, TIMINGS.VIDEO_POLL_INTERVAL);
        } else {
          setVideoError('Failed to check video status');
          setIsGeneratingVideo(false);
        }
      }
    };

    checkStatus();
  };

  /**
   * Generate 3D video from try-on image
   * Uses the latest edited image (includes blouse/neck/background changes)
   */
  const generateVideo = async () => {
    if (!videoSourceImage) {
      setVideoError('Try-on image required for video generation');
      return;
    }

    console.log('🎬 Starting video generation...');
    setIsGeneratingVideo(true);
    setVideoError('');
    setVideoProgress(0);

    try {
      // Create form data with try-on image
      const formData = await createVideoFormData(videoSourceImage);

      console.log('📤 Sending to video API...');

      // Create video generation task
      const createResponse = await fetch(API_ENDPOINTS.VIDEO_CREATE, {
        method: 'POST',
        body: formData,
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create video task');
      }

      const taskId = createData.taskId;
      setVideoTaskId(taskId);
      console.log('✅ Task created:', taskId);

      // Start polling for completion
      pollVideoStatus(taskId);
    } catch (err) {
      console.error('❌ Video generation error:', err);
      setVideoError(err.message || 'Failed to generate video');
      setIsGeneratingVideo(false);
    }
  };

  return {
    videoUrl,
    isGeneratingVideo,
    videoTaskId,
    videoProgress,
    videoError,
    videoStatus,
    generateVideo,
    setVideoUrl,
  };
};