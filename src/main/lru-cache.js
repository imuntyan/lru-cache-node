function LRUCache(maxSize) {

    this.getMaxSize = function() {
        return maxSize;
    }

    this.getNumElements = function() {
        return getNumElements()
    }

    this.put = function(key, value) {
        let node = map.get(key);
        if (node) {
            node.value = value;
            moveToFront(node);
        }
        else {
            node = new Node(key, value);
            map.set(key, node);
            if (getNumElements() > maxSize) {
                deleteNodeFromCache(tail);
            }
            addAsHead(node);
        }
    }

    this.get = function(key) {
        const node = map.get(key);
        if (!node) {
            return undefined;
        }
        else {
            moveToFront(node);
            return node.value;
        }
    }

    this.del = function(key) {
        const node = map.get(key);
        if (node) {
            deleteNodeFromCache(node);
        }
    }

    this.reset = function() {
        init();
    }

    this.getOrderedKeys = function*() {
        let node = head;
        while (node) {
            yield node.value;
            node = node.next;
        }
    }



    // Node instances implement a linked list, e.g.:
    // node1 = Node(value = 1, prev = null, next = node2)
    // node2 = Node(value = 2, prev = node1, next = node3)
    // ...
    // node_n = Node(value = n, prev = node_n-1, next = null)
    function Node(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }


    // mapping keys -> values
    let map = new Map();

    // Most recently used element
    let head = null;

    // Least recently used element
    let tail = null;

    // initialize the state to default values
    function init() {
        map = new Map();
        head = null;
        tail = null;
    }

    // links two nodes, automatically updates head and tail
    function linkNodes(prev, next) {
        if (prev) {
            prev.next = next;
        }
        else {
            // since prev is null, next becomes head
            head = next;
        }

        if (next) {
            next.prev = prev;
        }
        else {
            // since next is null, prev becomes tail
            tail = prev;
        }
    }

    function deleteNode(node) {
        // link prev and next
        linkNodes(node.prev, node.next);
    }

    function deleteNodeFromCache(node) {
        map.delete(node.key);
        deleteNode(node);
    }

    function moveToFront(node) {
        deleteNode(node);
        addAsHead(node);
    }

    function addAsHead(node) {
        const oldHead = head;
        linkNodes(null, node);
        linkNodes(node, oldHead);
    }

    function getNumElements() {
        return map.size;
    }
}

module.exports = LRUCache;