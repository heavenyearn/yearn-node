// 生成6位随机数
const getSixRandom = () => {
    return Math.floor(Math.random()*(10**6)).toString().padStart(6,'0')
}

module.exports = {
    getSixRandom
}