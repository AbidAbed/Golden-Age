const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger'); // Import the logger

const GOFILE_ACCOUNT_ID = process.env.GOFILE_ACCOUNT_ID;
const GOFILE_ACCOUNT_TOKEN = process.env.GOFILE_ACCOUNT_TOKEN;

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

const getBestServer = async () => {
  try {
    const response = await axios.get('https://api.gofile.io/servers');
    if (response.data.status === 'ok' && response.data.data.servers && response.data.data.servers.length > 0) {
      return response.data.data.servers[0].name;
    }
    throw new Error('Failed to get Gofile.io server');
  } catch (error) {
    logger.error('Error getting Gofile.io server:', error);
    throw error;
  }
};

const uploadFile = async (filePath, folderId = null) => {
  try {
    const server = await getBestServer();
    const uploadUrl = `https://${server}.gofile.io/uploadFile`;

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), path.basename(filePath));
    form.append('token', GOFILE_ACCOUNT_TOKEN);
    if (folderId) {
      form.append('folderId', folderId);
    }

    const response = await axios.post(uploadUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    if (response.data.status === 'ok') {
      return response.data.data; // Contains direct link, download link, etc.
    }
    throw new Error(`Gofile.io upload failed: ${response.data.status}`);
  } catch (error) {
    logger.error('Error uploading file to Gofile.io:', error);
    throw error;
  }
};

const uploadFromBuffer = async (buffer, originalName, folderId = null) => {
  try {
    const server = await getBestServer();
    const uploadUrl = `https://${server}.gofile.io/uploadFile`;

    const form = new FormData();
    form.append('file', buffer, originalName);
    form.append('token', GOFILE_ACCOUNT_TOKEN);
    if (folderId) {
      form.append('folderId', folderId);
    }

    const response = await axios.post(uploadUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (response.data.status === 'ok') {
      return response.data.data; // Contains direct link, download link, etc.
    }
    throw new Error(`Gofile.io upload failed: ${response.data.status}`);
  } catch (error) {
    logger.error('Error uploading buffer to Gofile.io:', error);
    throw error;
  }
};

const uploadToCloudinary = async (buffer, originalName, resourceType = 'image') => {
  try {
    const form = new FormData();
    form.append('file', buffer, originalName);
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (response.data.secure_url) {
      return response.data;
    }
    throw new Error('Cloudinary upload failed');
  } catch (error) {
    logger.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

const createFolder = async (folderName, parentFolderId = null) => {
  try {
    const response = await axios.put('https://api.gofile.io/createFolder', null, {
      params: {
        parentFolderId: parentFolderId || GOFILE_ACCOUNT_ID, // Use account ID as parent if no specific parent is given
        folderName: folderName,
        token: GOFILE_ACCOUNT_TOKEN,
      },
    });

    if (response.data.status === 'ok') {
      return response.data.data; // Contains folderId, folderName, etc.
    }
    throw new Error(`Gofile.io folder creation failed: ${response.data.status}`);
  } catch (error) {
    logger.error('Error creating folder on Gofile.io:', error);
    throw error;
  }
};

const deleteContent = async (contentId) => {
  try {
    const response = await axios.delete('https://api.gofile.io/deleteContent', {
      params: {
        contentId: contentId,
        token: GOFILE_ACCOUNT_TOKEN,
      },
    });

    if (response.data.status === 'ok') {
      return response.data.data;
    }
    throw new Error(`Gofile.io delete failed: ${response.data.status}`);
  } catch (error) {
    logger.error('Error deleting content from Gofile.io:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  uploadFromBuffer,
  uploadToCloudinary,
  createFolder,
  deleteContent,
};
