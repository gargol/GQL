var should = require('should'), // eslint-disable-line no-unused-vars
    gql = require('../lib/gql');

describe.only('Parser', function () {
    var parserError = /^Query Error: unexpected character in filter at char/;

    describe('Comparison Query Operators', function () {
        it('can parse standard equals', function () {
            gql.parse('count:5').should.eql({count: 5});

            gql.parse('tag:getting-started').should.eql({tag: 'getting-started'});

            gql.parse('author:\'Joe Bloggs\'').should.eql({author: 'Joe Bloggs'});

            gql.parse('author:123-test').should.eql({author: '123-test'});
        });

        it('can parse not equals', function () {
            gql.parse('count:-5').should.eql({count: {$ne: 5}});

            gql.parse('tag:-getting-started').should.eql({tag: {$ne: 'getting-started'}});

            gql.parse('author:-\'Joe Bloggs\'').should.eql({author: {$ne: 'Joe Bloggs'}});
        });

        it('can parse greater than', function () {
            gql.parse('count:>5').should.eql({count: {$gt: 5}});

            gql.parse('tag:>getting-started').should.eql({tag: {$gt: 'getting-started'}});

            gql.parse('author:>\'Joe Bloggs\'').should.eql({author: {$gt: 'Joe Bloggs'}});
        });

        it('can parse less than', function () {
            gql.parse('count:<5').should.eql({count: {$lt: 5}});

            gql.parse('tag:<getting-started').should.eql({tag: {$lt: 'getting-started'}});

            gql.parse('author:<\'Joe Bloggs\'').should.eql({author: {$lt: 'Joe Bloggs'}});
        });

        it('can parse greater than or equals', function () {
            gql.parse('count:>=5').should.eql({count: {$gte: 5}});

            gql.parse('tag:>=getting-started').should.eql({tag: {$gte: 'getting-started'}});

            gql.parse('author:>=\'Joe Bloggs\'').should.eql({author: {$gte: 'Joe Bloggs'}});
        });

        it('can parse less than or equals', function () {
            gql.parse('count:<=5').should.eql({count: {$lte: 5}});

            gql.parse('tag:<=getting-started').should.eql({tag: {$lte: 'getting-started'}});

            gql.parse('author:<=\'Joe Bloggs\'').should.eql({author: {$lte: 'Joe Bloggs'}});
        });

        it('can parse IN with single value', function () {
            gql.parse('count:[5]').should.eql({count: {$in: [5]}});

            gql.parse('tag:[getting-started]').should.eql({tag: {$in: ['getting-started']}});

            gql.parse('author:[\'Joe Bloggs\']').should.eql({author: {$in: ['Joe Bloggs']}});
        });

        it('can parse NOT IN with single value', function () {
            gql.parse('count:-[5]').should.eql({count: {$nin: [5]}});

            gql.parse('tag:-[getting-started]').should.eql({tag: {$nin: ['getting-started']}});

            gql.parse('author:-[\'Joe Bloggs\']').should.eql({author: {$nin: ['Joe Bloggs']}});
        });

        it('can parse IN with multiple values', function () {
            gql.parse('count:[5, 8, 12]').should.eql({count: {$in: [5, 8, 12]}});

            gql.parse('tag:[getting-started, ghost, really-long-1]')
                .should.eql({tag: {$in: ['getting-started', 'ghost', 'really-long-1']}});

            gql.parse('author:[\'Joe Bloggs\', \'John O\\\'Nolan\', \'Hello World\']')
                .should.eql({author: {$in: ['Joe Bloggs', 'John O\'Nolan', 'Hello World']}});
        });

        it('can parse NOT IN with single value', function () {
            gql.parse('count:-[5, 8, 12]').should.eql({count: {$nin: [5, 8, 12]}});

            gql.parse('tag:-[getting-started, ghost, really-long-1]')
                .should.eql({tag: {$nin: ['getting-started', 'ghost', 'really-long-1']}});

            gql.parse('author:-[\'Joe Bloggs\', \'John O\\\'Nolan\', \'Hello World\']')
                .should.eql({author: {$nin: ['Joe Bloggs', 'John O\'Nolan', 'Hello World']}});
        });
    });

    describe('Values', function () {
        it('can parse null', function () {
            gql.parse('image:null').should.eql({image: null});
        });

        it('can parse NOT null', function () {
            gql.parse('image:-null').should.eql({image: {$ne: null}});
        });

        it('can parse true', function () {
            gql.parse('featured:true').should.eql({featured: true});
        });

        it('can parse NOT true', function () {
            gql.parse('featured:-true').should.eql({featured: {$ne: true}});
        });

        it('can parse false', function () {
            gql.parse('featured:false').should.eql({featured: false});
        });

        it('can parse NOT false', function () {
            gql.parse('featured:-false').should.eql({featured: {$ne: false}});
        });

        it('can parse a Number', function () {
            gql.parse('count:5').should.eql({count: 5});
        });

        it('can parse NOT a Number', function () {
            gql.parse('count:-5').should.eql({count: {$ne: 5}});
        });
    });

    describe.skip('simple expressions', function () {
        it('should parse simple id & value combos', function () {
            gql.parse('id:3').should.eql({
                statements: [
                    {prop: 'id', op: '=', value: 3}
                ]
            });

            gql.parse('slug:getting-started').should.eql({
                statements: [
                    {prop: 'slug', op: '=', value: 'getting-started'}
                ]
            });
        });
    });

    describe.skip('complex examples', function () {
        it('many expressions', function () {
            gql.parse('tag:photo+featured:true,tag.count:>5').should.eql({
                statements: [
                    {op: '=', value: 'photo', prop: 'tag'},
                    {op: '=', value: true, prop: 'featured', func: 'and'},
                    {op: '>', value: 5, prop: 'tag.count', func: 'or'}
                ]
            });

            gql.parse('tag:photo+image:-null,tag.count:>5').should.eql({
                statements: [
                    {op: '=', value: 'photo', prop: 'tag'},
                    {op: 'IS NOT', value: null, prop: 'image', func: 'and'},
                    {op: '>', value: 5, prop: 'tag.count', func: 'or'}
                ]
            });
        });

        it('grouped expressions', function () {
            gql.parse('author:-joe+(tag:photo,image:-null,featured:true)').should.eql({
                statements: [
                    {op: '!=', value: 'joe', prop: 'author'},
                    {
                        group: [
                            {op: '=', value: 'photo', prop: 'tag'},
                            {op: 'IS NOT', value: null, prop: 'image', func: 'or'},
                            {op: '=', value: true, prop: 'featured', func: 'or'}
                        ], func: 'and'
                    }
                ]
            });

            gql.parse('(tag:photo,image:-null,featured:true)+author:-joe').should.eql({
                statements: [
                    {
                        group: [
                            {op: '=', value: 'photo', prop: 'tag'},
                            {op: 'IS NOT', value: null, prop: 'image', func: 'or'},
                            {op: '=', value: true, prop: 'featured', func: 'or'}
                        ]
                    },
                    {op: '!=', value: 'joe', prop: 'author', func: 'and'}
                ]
            });

            gql.parse('author:-joe,(tag:photo,image:-null,featured:true)').should.eql({
                statements: [
                    {op: '!=', value: 'joe', prop: 'author'},
                    {
                        group: [
                            {op: '=', value: 'photo', prop: 'tag'},
                            {op: 'IS NOT', value: null, prop: 'image', func: 'or'},
                            {op: '=', value: true, prop: 'featured', func: 'or'}
                        ], func: 'or'
                    }
                ]
            });

            gql.parse('(tag:photo,image:-null,featured:false),author:-joe').should.eql({
                statements: [
                    {
                        group: [
                            {op: '=', value: 'photo', prop: 'tag'},
                            {op: 'IS NOT', value: null, prop: 'image', func: 'or'},
                            {op: '=', value: false, prop: 'featured', func: 'or'}
                        ]
                    },
                    {op: '!=', value: 'joe', prop: 'author', func: 'or'}
                ]
            });
        });

        it('in expressions', function () {
            gql.parse('author:-joe+tag:[photo,video]').should.eql({
                statements: [
                    {op: '!=', value: 'joe', prop: 'author'},
                    {op: 'IN', value: ['photo', 'video'], prop: 'tag', func: 'and'}
                ]
            });

            gql.parse('author:-joe+tag:-[photo,video,audio]').should.eql({
                statements: [
                    {op: '!=', value: 'joe', prop: 'author'},
                    {op: 'NOT IN', value: ['photo', 'video', 'audio'], prop: 'tag', func: 'and'}
                ]
            });

            gql.parse('author:-joe+tag:[photo,video,magic,\'audio\']+post.count:>5+post.count:<100').should.eql({
                statements: [
                    {op: '!=', value: 'joe', prop: 'author'},
                    {op: 'IN', value: ['photo', 'video', 'magic', 'audio'], prop: 'tag', func: 'and'},
                    {op: '>', value: 5, prop: 'post.count', func: 'and'},
                    {op: '<', value: 100, prop: 'post.count', func: 'and'}
                ]
            });
        });
    });

    describe.skip('whitespace rules', function () {
        it('will ignore whitespace in expressions', function () {
            gql.parse('count: -5').should.eql(gql.parse('count:-5'));
            gql.parse('author: -joe + tag: [photo, video]').should.eql(gql.parse('author:-joe+tag:[photo,video]'));
        });

        it('will not ignore whitespace in Strings', function () {
            gql.parse('author:\'Hello World\'').should.not.eql(gql.parse('author:\'HelloWorld\''));
        });
    });

    describe.skip('invalid expressions', function () {
        it('CANNOT parse characters outside of a STRING value', function () {
            (function () {
                gql.parse('tag:\'My Tag\'-');
            }).should.throw(parserError);
        });

        it('CANNOT parse property - operator - value in wrong order', function () {
            (function () {
                gql.parse('\'My Tag\':tag');
            }).should.throw(parserError);
            (function () {
                gql.parse('5>:tag');
            }).should.throw(parserError);
        });

        it('CANNOT parse combination without filter expression', function () {
            (function () {
                gql.parse('count:3+');
            }).should.throw(parserError);
            (function () {
                gql.parse(',count:3');
            }).should.throw(parserError);
        });

        it('CANNOT parse incomplete group', function () {
            (function () {
                gql.parse('id:5,(count:3');
            }).should.throw(parserError);
            (function () {
                gql.parse('count:3)');
            }).should.throw(parserError);
            (function () {
                gql.parse('id:5(count:3)');
            }).should.throw(parserError);
        });

        it('CANNOT parse invalid IN expression', function () {
            (function () {
                gql.parse('id:[test+ing]');
            }).should.throw(parserError);
            (function () {
                gql.parse('id:[test');
            }).should.throw(parserError);
            (function () {
                gql.parse('id:test,ing]');
            }).should.throw(parserError);
        });
    });
});
