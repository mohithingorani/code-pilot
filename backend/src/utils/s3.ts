import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config()

const s3 = new S3Client({
    region: "auto",
    credentials: {
        accessKeyId: process.env.accessKeyId!,
        secretAccessKey: process.env.secretAccessKey!,
    },
    endpoint: process.env.endpoint!,
})

const bucketName = "codepilot-bucket";
const baseFolder = "./codepilot_storage";

async function uploadDirector(dirPath:string){
  const items = fs.readdirSync(dirPath);
  console.log(items);
  
  for (const item of items) {
    const fullPath = path.join(dirPath,item);
    const stats = fs.statSync(fullPath);
    if(stats.isDirectory()){
      await uploadDirector(fullPath);
    }
    else{
      const s3Key = path
                    .relative(baseFolder,fullPath)
                    .split(path.sep)
                    .join("/");

      const command = new PutObjectCommand({
        Bucket:bucketName,
        Key:s3Key,
        Body:fs.createReadStream(fullPath)
      });

      await s3.send(command);
      console.log(`Uploaded ${s3Key}`);
    }
  }
}

uploadDirector(baseFolder)











