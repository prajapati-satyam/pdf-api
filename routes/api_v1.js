import express from 'express'
import {decrypt_pdf, encrypt_pdf} from '../controller/encrypt_decrypt_controller_pdf.js';
import bulk_pdf_encrypt from '../controller/bulk_encrypt_decrypt_controller.js'
import merge_pdf_controller from '../controller/merge_controller.js';
import split_pdf_controllter from '../controller/split_controller.js';
import {bulk_pdf_decrypt} from '../controller/bulk_encrypt_decrypt_controller.js'
import set_cookies from '../controller/set_cookies.controller.js';
import get_user_info_cookies from '../middleware/getuserinfo.middleware.js';
import clear_cookies from '../controller/clear_cookies.controller.js';
import { unlock_adhar } from '../controller/unlock_adhar.controller.js';
import unlock_xlsx from '../controller/unlock_xlsx.controller.js'

const router_api_v1 = express.Router();

router_api_v1.post('/upload/encrypt', encrypt_pdf);
router_api_v1.post('/upload/decrypt', decrypt_pdf);
router_api_v1.post('/upload/bulk/encrypt', bulk_pdf_encrypt);
router_api_v1.post('/upload/bulk/decrypt', bulk_pdf_decrypt);
router_api_v1.post('/upload/split', split_pdf_controllter);
router_api_v1.post('/upload/merge', merge_pdf_controller);

//adhar card unlocked route
router_api_v1.post('/upload/unlock/adhar', get_user_info_cookies, unlock_adhar);

// xlsx unlocked
router_api_v1.post('/upload/unlock/xlsx', unlock_xlsx)

//set cookies and store user info using jwt
router_api_v1.post('/set-cookies', set_cookies);
router_api_v1.post('/change-cookies', set_cookies);
// for test only
// router_api_v1.post('/verify', get_user_info_cookies);


router_api_v1.post('/clear', clear_cookies);

export default router_api_v1