# Cloudinary Integration Setup

This project now supports Cloudinary for image uploads and management. Here's how to set it up:

## 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
```

## 2. Getting Your Cloudinary Credentials

1. **Sign up** at [cloudinary.com](https://cloudinary.com)
2. **Go to Dashboard** → Your account dashboard will show:
   - **Cloud Name**: Found in the dashboard
   - **API Key**: Found in the dashboard
   - **API Secret**: Found in the dashboard
3. **Create Upload Preset** (optional but recommended):
   - Go to Settings → Upload
   - Create a new upload preset
   - Set signing mode to "Unsigned" for client-side uploads
   - Or keep it signed for server-side uploads

## 3. Features Implemented

### ✅ Image Upload
- Upload images directly to Cloudinary
- Automatic file validation (JPEG, PNG, WebP)
- 5MB file size limit
- Multiple file upload support

### ✅ Image Management
- Store Cloudinary URLs in database
- Automatic image deletion when removed from products
- Support for both local and Cloudinary images

### ✅ Image Optimization
- Automatic format optimization (WebP when supported)
- Quality optimization
- Responsive image sizing

### ✅ Components Updated
- `ProductForm`: Upload and manage product images
- `ProductCard`: Display product images
- `ProductDetail`: Show all product images
- All components handle both local and Cloudinary URLs

## 4. API Endpoints

### Upload Images
```
POST /api/upload
Content-Type: multipart/form-data

Body: FormData with 'file' field(s)
```

### Delete Images
```
DELETE /api/upload/delete
Content-Type: application/json

Body: { "publicIds": ["public_id_1", "public_id_2"] }
```

## 5. Database Schema

The `Product` model uses an `images` field of type `String[]` to store image URLs:

```prisma
model Product {
  images String[] // Array of image URLs (local or Cloudinary)
  // ... other fields
}
```

## 6. Migration from Local Storage

If you have existing products with local images, they will continue to work. New uploads will go to Cloudinary.

## 7. Image URLs

Cloudinary URLs are stored in this format:
```
https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
```

## 8. Benefits

- **CDN Delivery**: Fast global image delivery
- **Automatic Optimization**: Format and quality optimization
- **Transformations**: On-the-fly image transformations
- **Storage Management**: Centralized image storage
- **Bandwidth Savings**: Optimized delivery reduces bandwidth usage

## 9. Troubleshooting

### Common Issues:

1. **Upload Fails**: Check your API credentials
2. **Images Not Displaying**: Verify Cloudinary URLs are correct
3. **Delete Fails**: Ensure public IDs are correct

### Debug Mode:
Set `NODE_ENV=development` to see detailed error logs.

## 10. Next Steps

After setting up your credentials:
1. Test image upload in the product form
2. Verify images display correctly
3. Test image deletion functionality
4. Monitor your Cloudinary usage dashboard
