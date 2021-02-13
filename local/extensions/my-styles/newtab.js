chrome.bookmarks.getTree(
    function(nodes) {
        var descend = function(nodes, output_on) {
            for (var i=0; i < nodes.length; i++) {
                var node = nodes[i];
                var p = document.createElement('p');
                //console.log(node);
                if (output_on) {
                    p.innerHTML = '<a href="' + node.url + '">'
                        + node.title + '</a>';
                    document.body.appendChild(p);
                }
                if (node.hasOwnProperty('children')) {
                    descend(node.children, node.title == 'Bookmarks bar');
                }
            }
        }
        descend(nodes, 0);
    }
);
