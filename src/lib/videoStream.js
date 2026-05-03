// ============================================
// 🎬 ADAPTIVE VIDEO STREAMING (HLS via Cloudinary)
// Converts raw MP4 URLs to HLS m3u8 for adaptive bitrate
// Videos auto-adjust quality based on student's internet speed
// ============================================

/**
 * Convert a Cloudinary video URL to HLS (m3u8) streaming URL.
 * This enables adaptive bitrate streaming so students on
 * slow connections get 480p while fast connections get 1080p.
 *
 * @param {string} videoUrl - Original Cloudinary video URL (MP4)
 * @returns {{ hlsUrl: string, mp4Url: string, isCloudinary: boolean }}
 */
export function getStreamingUrls(videoUrl) {
  if (!videoUrl) {
    return { hlsUrl: '', mp4Url: '', isCloudinary: false };
  }

  // Check if this is a Cloudinary URL
  const isCloudinary = videoUrl.includes('res.cloudinary.com') || videoUrl.includes('cloudinary');

  if (!isCloudinary) {
    // Non-Cloudinary URLs: just return as-is for MP4 playback
    return { hlsUrl: '', mp4Url: videoUrl, isCloudinary: false };
  }

  // Cloudinary HLS transformation:
  // Original: https://res.cloudinary.com/CLOUD/video/upload/v123/folder/video.mp4
  // HLS:      https://res.cloudinary.com/CLOUD/video/upload/sp_hd/v123/folder/video.m3u8
  //
  // sp_hd = streaming profile "hd" which creates multiple quality variants
  // Cloudinary auto-generates 240p, 360p, 480p, 720p, 1080p segments

  try {
    const url = new URL(videoUrl);
    const pathParts = url.pathname.split('/');

    // Find the "upload" segment index
    const uploadIdx = pathParts.indexOf('upload');
    if (uploadIdx === -1) {
      return { hlsUrl: '', mp4Url: videoUrl, isCloudinary: true };
    }

    // Insert streaming profile transformation after 'upload'
    // Also add quality auto and format optimization
    const hlsParts = [...pathParts];

    // Check if there's already a transformation after upload
    const afterUpload = hlsParts[uploadIdx + 1];
    if (afterUpload && afterUpload.startsWith('v')) {
      // No existing transformation — insert sp_hd before the version
      hlsParts.splice(uploadIdx + 1, 0, 'sp_hd');
    } else {
      // There's an existing transformation — prepend sp_hd
      hlsParts[uploadIdx + 1] = `sp_hd/${hlsParts[uploadIdx + 1]}`;
    }

    // Change extension from .mp4 to .m3u8
    const lastIdx = hlsParts.length - 1;
    hlsParts[lastIdx] = hlsParts[lastIdx].replace(/\.\w+$/, '.m3u8');

    const hlsUrl = `${url.protocol}//${url.host}${hlsParts.join('/')}`;

    return { hlsUrl, mp4Url: videoUrl, isCloudinary: true };
  } catch (err) {
    console.error('HLS URL generation failed:', err.message);
    return { hlsUrl: '', mp4Url: videoUrl, isCloudinary: true };
  }
}

/**
 * Get optimized thumbnail URL from Cloudinary video.
 * @param {string} videoUrl - Cloudinary video URL
 * @param {object} options - { width, height, quality }
 * @returns {string} Thumbnail URL
 */
export function getVideoThumbnail(videoUrl, options = {}) {
  if (!videoUrl || !videoUrl.includes('cloudinary')) return '';

  const { width = 640, height = 360, quality = 'auto' } = options;

  try {
    const url = new URL(videoUrl);
    const pathParts = url.pathname.split('/');
    const uploadIdx = pathParts.indexOf('upload');

    if (uploadIdx === -1) return '';

    const thumbParts = [...pathParts];
    const transformation = `w_${width},h_${height},c_fill,q_${quality},so_3`;

    const afterUpload = thumbParts[uploadIdx + 1];
    if (afterUpload && afterUpload.startsWith('v')) {
      thumbParts.splice(uploadIdx + 1, 0, transformation);
    } else {
      thumbParts[uploadIdx + 1] = `${transformation}/${thumbParts[uploadIdx + 1]}`;
    }

    // Change extension to jpg
    const lastIdx = thumbParts.length - 1;
    thumbParts[lastIdx] = thumbParts[lastIdx].replace(/\.\w+$/, '.jpg');

    return `${url.protocol}//${url.host}${thumbParts.join('/')}`;
  } catch {
    return '';
  }
}
