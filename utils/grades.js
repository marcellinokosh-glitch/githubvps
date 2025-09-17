const fs = require('fs');
const path = require('path');
const gradesPath = path.join(__dirname, '..', 'grades.json');

function getGrades() {
    try {
        return JSON.parse(fs.readFileSync(gradesPath, 'utf8'));
    } catch {
        return { dev: [], owner: [], wl: [] };
    }
}

function hasGrade(userId, grade) {
    const grades = getGrades();
    return Array.isArray(grades[grade]) && grades[grade].includes(userId);
}

module.exports = { hasGrade };