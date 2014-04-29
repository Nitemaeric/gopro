binStringToHex = function(s) {
  var s2 = [], c;
  for ( var i = 0, l = s.length; i < l; ++i ) {
    c = s.charCodeAt(i);
    s2.push((c >> 4 ).toString(16), (c & 0xF ).toString(16));
  }
  String.prototype.concat.apply('',s2);
  return s2;
}


module.exports.binStringToHex = binStringToHex