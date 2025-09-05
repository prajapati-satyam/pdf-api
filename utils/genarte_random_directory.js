import fs from 'fs'


const genrate_random_direcory = () => {
     const random_dir = fs.mkdtempSync('hello');
     return random_dir;
}


export default genrate_random_direcory;