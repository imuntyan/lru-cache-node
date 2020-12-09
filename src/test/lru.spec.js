const mocha = require('mocha');
const chai = require('chai');
const [expect] = [chai.expect];
const [describe, beforeEach, it] = [mocha.describe, mocha.beforeEach, mocha.it];

const LRUCache = require('../main/lru-cache')

describe('LRUCache', () => {

    let lru;

    beforeEach(() => {
        lru = new LRUCache(4);
    });

    it('should be able delete from empty cache', () => {
        expect(lru.getNumElements()).to.be.eq(0);
        lru.del(1);
        expect(lru.getNumElements()).to.be.eq(0);
        lru.del({"a": 42});
        expect(lru.getNumElements()).to.be.eq(0);
    });
    it('should support complex keys', () => {
        expect(lru.getNumElements()).to.be.eq(0);
        const o1 = [];
        const o2 = {"a": {"b": 42, "c": true}, "d": 3.14};
        const o3 = function(x) {return x*3;};
        lru.put(o1, 1);
        expect(lru.getNumElements()).to.be.eq(1);
        lru.put(o2, 2);
        expect(lru.getNumElements()).to.be.eq(2);
        lru.put(o3, 3);
        expect(lru.getNumElements()).to.be.eq(3);
        expect(lru.get(o1)).to.be.eq(1);
        expect(lru.get(o2)).to.be.eq(2);
        expect(lru.get(o3)).to.be.eq(3);
    });
    it('should use strict object equality', () => {
        expect(lru.getNumElements()).to.be.eq(0);
        const o = {"a": 1};
        lru.put(o, 'a');
        expect(lru.getNumElements()).to.be.eq(1);
        lru.put({"a": 1}, 'b');
        expect(lru.getNumElements()).to.be.eq(2);
        expect(lru.get({"a": 1})).to.be.eq(undefined);
        expect(lru.get(o)).to.be.eq('a');
    });

    it('should allow undefined and null keys', () => {
        expect(lru.getNumElements()).to.be.eq(0);
        lru.put(undefined, 2);
        expect(lru.getNumElements()).to.be.eq(1);
        expect(lru.get(undefined)).to.be.eq(2);
        lru.put(undefined, 5);
        expect(lru.getNumElements()).to.be.eq(1);
        expect(lru.get(undefined)).to.be.eq(5);
        lru.put(null, 'abc');
        expect(lru.getNumElements()).to.be.eq(2);
        expect(lru.get(null)).to.be.eq('abc');
        lru.put(null, 'def');
        expect(lru.getNumElements()).to.be.eq(2);
        expect(lru.get(null)).to.be.eq('def');
    });

    it('should not go over the limit', () => {
        expect(lru.getNumElements()).to.be.eq(0);
        lru.put('a', 2);
        expect(lru.getNumElements()).to.be.eq(1);
        lru.put('a', 3);
        expect(lru.getNumElements()).to.be.eq(1);
        lru.put(2, 'a');
        expect(lru.getNumElements()).to.be.eq(2);
        lru.put(2, 2);
        expect(lru.getNumElements()).to.be.eq(2);
        lru.put(3, 'b');
        expect(lru.getNumElements()).to.be.eq(3);
        lru.put(4, 2);
        expect(lru.getNumElements()).to.be.eq(4);
        lru.put(5, 7);
        expect(lru.getNumElements()).to.be.eq(4);
        lru.put({}, 2);
        expect(lru.getNumElements()).to.be.eq(4);
    });

    it('should correctly delete elements', () => {
        expect(lru.getNumElements()).to.be.eq(0);
        lru.put('d', 'd');
        lru.put('c', 'c');
        lru.put('b', 'b');
        lru.put('a', 'a');
        expect(lru.getNumElements()).to.be.eq(4);

        // delete from the middle
        lru.del('b');
        expect(lru.getNumElements()).to.be.eq(3);
        expect(lru.get('b')).to.be.eq(undefined);

        // delete first
        lru.del('a');
        expect(lru.getNumElements()).to.be.eq(2);
        expect(lru.get('a')).to.be.eq(undefined);

        // delete last
        lru.del('d');
        expect(lru.getNumElements()).to.be.eq(1);
        expect(lru.get('d')).to.be.eq(undefined);

        expect(lru.get('c')).to.be.eq('c');

    });

    it('should replace value for the same key', () => {
        lru.put('a', 'abc');
        expect(lru.get('a')).to.be.eq('abc');
        lru.put('a', 'def');
        expect(lru.get('a')).to.be.eq('def');
        lru.put('a', undefined);
        expect(lru.get('a')).to.be.eq(undefined);
        lru.put('a', null);
        expect(lru.get('a')).to.be.eq(null);
    });

    it('should evict the least recently used elements', () => {
        lru.put('a', 'a');
        lru.put('b', 'b');
        lru.put('c', 'c');
        lru.put('d', 'd');
        // d, c, b, a
        expect(lru.getNumElements()).to.be.eq(4);

        lru.get('a');
        // a, d, c, b
        lru.put('e', 'e');
        // e, a, d, c
        lru.get('b');
        // reading non-existing 'b' is a no-op
        // still e, a, d, c
        expect(lru.getNumElements()).to.be.eq(4);
        expect(lru.get('e')).to.be.eq('e');
        expect(lru.get('a')).to.be.eq('a');
        expect(lru.get('d')).to.be.eq('d');
        expect(lru.get('c')).to.be.eq('c');
        expect(lru.get('b')).to.be.eq(undefined);
    });

    it('should implement getOrderedKeys correctly', () => {
        lru.put('a', 'a');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq(['a']);

        lru.put('b', 'b');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq(['b', 'a']);

        lru.put('c', 'c');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq(['c', 'b', 'a']);

        lru.put('d', 'd');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq(['d', 'c', 'b', 'a']);

        lru.get('a');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq(['a', 'd', 'c', 'b']);

        lru.put('c', 'c');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq(['c', 'a', 'd', 'b']);

        lru.put('e', 'e');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq(['e', 'c', 'a', 'd']);

        lru.del('c');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq(['e', 'a', 'd']);

        lru.del('d');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq(['e', 'a']);

        lru.del('e');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq(['a']);

        lru.del('a');
        expect([...lru.getOrderedKeys()]).to.be.deep.eq([]);
    });

    it('should reset to empty cache', () => {

        lru.put('a', 'a');
        lru.put('b', 'b');
        lru.put('c', 'c');
        expect(lru.getNumElements()).to.be.eq(3);

        lru.reset();

        expect(lru.getNumElements()).to.be.eq(0);
        expect(lru.get('a')).to.be.eq(undefined);
        expect(lru.get('b')).to.be.eq(undefined);
        expect(lru.get('c')).to.be.eq(undefined);

        lru.put('a', 'a');
        lru.put('b', 'b');
        lru.put('c', 'c');
        lru.put('d', 'd');
        lru.put('e', 'e');
        expect(lru.getNumElements()).to.be.eq(4);
        expect(lru.get('b')).to.be.eq('b');
        expect(lru.get('a')).to.be.eq(undefined);
    });

});
