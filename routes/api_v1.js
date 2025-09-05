import express from 'express'
import { Router } from 'express'
import {decrypt_pdf, encrypt_pdf} from '../controller/encrypt_decrypt_controller_pdf.js';
import bulk_pdf_encrypt from '../controller/bulk_encrypt_decrypt_controller.js'

const router_api_v1 = express.Router();

router_api_v1.post('/upload/encrypt', encrypt_pdf);
router_api_v1.post('/upload/decrypt', decrypt_pdf);
router_api_v1.post('/upload/bulk/encrypt', bulk_pdf_encrypt);

export default router_api_v1