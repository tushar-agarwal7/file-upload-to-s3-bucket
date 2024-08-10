import express, { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { MulterError } from 'multer';
import cors from 'cors'

dotenv.config();

const app = express();

app.use(cors());

const storage = multer.memoryStorage(); 
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only images are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter
});

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
  region: process.env.REACT_APP_AWS_REGION!
});

// Route for handling file uploads
app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;

  // Check if a file was uploaded
  if (!file) {
    return res.status(400).send('No file uploaded');
  }
  console.log(file)

  // Parameters for S3 upload
  const params = {
    Bucket: process.env.REACT_APP_S3_BUCKET_NAME!,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    await s3.upload(params).promise();
    res.status(200).send('File uploaded to S3 successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to S3');
  }
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof MulterError) {
    res.status(400).send('Multer error: ' + error.message);
  } else if (error) {
    res.status(400).send('Error: ' + error.message);
  } else {
    next();
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
