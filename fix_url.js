const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/pages');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Fix variable declarations like const BASE_URL = 'http://localhost:3000';
    if (content.includes("'http://localhost:3000'") || content.includes('"http://localhost:3000"')) {
        content = content.replace(/['"]http:\/\/localhost:3000['"]/g, "(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')");
        changed = true;
    }

    // Fix template literals like `http://localhost:3000${...}`
    if (content.includes("http://localhost:3000")) {
        content = content.replace(/http:\/\/localhost:3000/g, "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed:', file);
    }
});

console.log('Semua file berhasil diupdate!');
