# Public File Organization Structure

This folder contains all publicly accessible files organized by type for better management and serving.

## Folder Structure

```
public/
└── uploads/
    ├── software/          # Executable files, installers, archives
    │   ├── .exe           # Windows executables
    │   ├── .msi           # Windows installers
    │   ├── .zip/.rar/.7z  # Compressed archives
    │   ├── .dmg/.pkg      # macOS packages
    │   └── .deb/.rpm/.apk # Linux/Android packages
    │
    ├── screenshots/       # Preview images
    │   ├── .jpg/.jpeg     # JPEG images
    │   ├── .png           # PNG images
    │   ├── .gif           # GIF images
    │   └── .webp          # WebP images
    │
    ├── videos/           # Preview videos
    │   ├── .mp4          # MP4 videos
    │   ├── .webm         # WebM videos
    │   ├── .avi          # AVI videos
    │   └── .mov          # MOV videos
    │
    ├── avatars/          # User profile pictures
    │   ├── .jpg/.jpeg    # JPEG avatars
    │   ├── .png          # PNG avatars
    │   └── .gif          # Animated avatars
    │
    └── temp/             # Temporary/uncategorized files
        └── *             # Files that don't fit other categories
```

## File Naming Convention

All uploaded files follow this naming pattern:
```
{originalBaseName}-{timestamp}-{randomNumber}.{extension}
```

Example: `PhotoshopCC-1699123456789-987654321.exe`

## API Endpoints

### File Upload
- `POST /api/posts/upload` - Single file upload (for software)
- `POST /api/posts/upload-multi` - Multiple files (software + screenshots + videos)
- `PUT /api/posts/:id/upload` - Update files for existing post

### File Access
- `GET /uploads/software/{filename}` - Download software files
- `GET /uploads/screenshots/{filename}` - View screenshot images
- `GET /uploads/videos/{filename}` - Stream video files
- `GET /uploads/avatars/{filename}` - View user avatars

## File Type Detection

Files are automatically sorted into folders based on:

1. **Field name** in upload form (software, screenshots, videos, avatar)
2. **File extension** (.exe, .jpg, .mp4, etc.)
3. **MIME type** (application/*, image/*, video/*)

## Security Notes

- All file types are allowed for software distribution
- 500MB file size limit per upload
- Rate limiting applied to prevent abuse
- Files are served with proper MIME types
- No execution of uploaded files on server

## Maintenance

- Clean up temp folder regularly
- Monitor disk space usage
- Archive old files if needed
- Backup important software packages