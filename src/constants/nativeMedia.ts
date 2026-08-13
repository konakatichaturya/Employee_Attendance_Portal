// Direct CDN URLs for the same free-licensed stock media used on the web
// build (see public/videos/NOTICE.md and public/images/NOTICE.md for
// license details). Native can't bundle files from public/ (that folder is
// web-only), so these screens stream the same source clips/photos over the
// network instead of loading a local asset.

export const NATIVE_VIDEO = {
  attendance: 'https://assets.mixkit.co/videos/4801/4801-720.mp4',
  leave: 'https://assets.mixkit.co/videos/46755/46755-720.mp4',
  calendar: 'https://assets.mixkit.co/videos/17412/17412-720.mp4',
} as const;

export const NATIVE_IMAGE = {
  attendance: 'https://images.pexels.com/photos/37538043/pexels-photo-37538043.jpeg',
  leave: 'https://images.pexels.com/photos/6170644/pexels-photo-6170644.jpeg',
  calendar: 'https://images.pexels.com/photos/11333728/pexels-photo-11333728.jpeg',
  team: 'https://images.pexels.com/photos/32082430/pexels-photo-32082430.jpeg',
  location: 'https://images.pexels.com/photos/7663519/pexels-photo-7663519.jpeg',
  approvals: 'https://images.pexels.com/photos/7641994/pexels-photo-7641994.jpeg',
} as const;
