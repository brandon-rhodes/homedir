chrome.bookmarks.getTree(
    function(nodes) {
        var descend = function(nodes, output_on) {
            var paragraph = document.createElement('p');
            paragraph.setAttribute('style', 'line-height: 2; font-size: 1.5em')
            for (var i=0; i < nodes.length; i++) {
                var node = nodes[i];
                if (output_on) {
                    var b = document.createElement('span');
                    b.innerHTML = '<a href="' + node.url + '"'
                        + ' style="margin-right: 2em">'
                        + node.title + '</a> ';
                    paragraph.appendChild(b);
                    paragraph.append(' ');
                }
                if (node.hasOwnProperty('children')) {
                    descend(node.children, node.title == 'Bookmarks bar');
                }
            }
            document.body.appendChild(paragraph);
        }
        descend(nodes, 0);
    }
);
