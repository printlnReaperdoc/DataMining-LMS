const { courseData, modulesData, chaptersData: part1 } = require('./seedDataPart1');
const { chaptersDataPart2: part2 } = require('./seedDataPart2');

const chaptersData = [...part1, ...part2];

module.exports = {
  courseData,
  modulesData,
  chaptersData
};

