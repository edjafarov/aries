module.exports = function sourceReader(source) {
    var source;
    var currentPosition = 0;
    return {
        findNext: function(str) {
            newPosition = source.indexOf(str, currentPosition + 1);
            return (newPosition == -1) ? false : (currentPosition = newPosition, newPosition);
        },
        findPrevious: function(str) {
            newPosition = source.lastIndexOf(str, currentPosition - 1);
            return (newPosition == -1) ? false : (currentPosition = newPosition, newPosition);
        },
        checkNext: function(str) {
            return source.indexOf(str, currentPosition + 1);
        },
        checkPrevious: function(str) {
            return source.lastIndexOf(str, currentPosition - 1);
        },
        getString: function(pos1, pos2) {
            return source.substring(pos1, pos2);
        }
    }
}