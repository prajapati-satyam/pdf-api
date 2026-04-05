import express from 'express'
import { Router } from 'express'
import {decrypt_pdf, encrypt_pdf} from '../controller/encrypt_decrypt_controller_pdf.js';
import bulk_pdf_encrypt from '../controller/bulk_encrypt_decrypt_controller.js'
import merge_pdf_controller from '../controller/merge_controller.js';
import split_pdf_controllter from '../controller/split_controller.js';
import {bulk_pdf_decrypt} from '../controller/bulk_encrypt_decrypt_controller.js'

const router_api_v1 = express.Router();

router_api_v1.post('/upload/encrypt', encrypt_pdf);
router_api_v1.post('/upload/decrypt', decrypt_pdf);
router_api_v1.post('/upload/bulk/encrypt', bulk_pdf_encrypt);
router_api_v1.post('/upload/bulk/decrypt', bulk_pdf_decrypt);
router_api_v1.post('/upload/split', split_pdf_controllter);
router_api_v1.post('/upload/merge', merge_pdf_controller);

export default router_api_v1