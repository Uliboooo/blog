const YOUTUBE_VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

const getVideoId = (url) => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (hostname === "youtube.com" || hostname === "www.youtube.com") {
      return parsed.pathname === "/watch" ? parsed.searchParams.get("v") : null;
    }
  } catch {
    return null;
  }

  return null;
};

const buildEmbedHtml = (videoId) => `<iframe
  src="https://www.youtube.com/embed/${videoId}"
  style="width: 100%; aspect-ratio: 16 / 9; border: 0;"
  title="YouTube video player"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>`;

// A paragraph that is just a bare YouTube URL, including one produced by GFM
// autolinking, becomes a responsive video embed.
const extractVideoId = (node) => {
  if (node?.type !== "paragraph" || node.children?.length !== 1) return null;

  const child = node.children[0];
  const url =
    child.type === "link" &&
    child.children?.length === 1 &&
    child.children[0]?.type === "text"
      ? child.url
      : child.type === "text"
        ? child.value.trim()
        : null;
  const videoId = url ? getVideoId(url) : null;

  return videoId && YOUTUBE_VIDEO_ID_RE.test(videoId) ? videoId : null;
};

const remarkYoutubeEmbed = () => {
  return (tree) => {
    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return;

      node.children = node.children.map((child) => {
        const videoId = extractVideoId(child);
        if (videoId) {
          return { type: "html", value: buildEmbedHtml(videoId) };
        }
        walk(child);
        return child;
      });
    };

    walk(tree);
  };
};

export default remarkYoutubeEmbed;
