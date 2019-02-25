/* eslint-disable */
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

const articlesMock = [
    {
        _id: '123',
        author: 'zxc',
        title: 'zxc',
        description: 'zxc',
        publishedAt: 'zxc',
        content: 'zxc',
        urlToImage: 'zxc',
        url: 'zxc'
    },
    {
        _id: '456',
        author: 'asd',
        title: 'asd',
        description: 'asd',
        publishedAt: 'asd',
        content: 'asd',
        urlToImage: 'asd',
        url: 'asd'
    }
];

const articleMock = {
    _id: '789',
    author: 'qwe',
    title: 'qwe',
    description: 'qwe',
    publishedAt: 'qwe',
    content: 'qwe',
    urlToImage: 'qwe',
    url: 'we'
};

function ArticleMock() {
    return ArticleMock;
}

const app = proxyquire('../app', {
    './auth': {
        isLoggedIn: (req, res, next) => next()
    },
    'mongoose': {
        connect: () => {},
        connection: {
            on: () => {}
        },
        Types: {
            ObjectId: () => {}
        }
    },
    'connect-mongo': () => {
        return function() {
            return {
                on: () => {}
            };
        }
    },
    './schemas': {
        Article: ArticleMock
    },
    'passport': {
        use: () => {},
        serializeUser: () => {},
        deserializeUser: () => {},
        initialize: () => {
            return (req, res, next) => next();
        },
        session: () => {
            return (req, res, next) => next();
        }
    },
    'passport-facebook': function() {
        return {};
    },
    
});

const errorMessage = 'error';

let findCbArgs, saveCbArgs, updateCbArgs, deleteCbArgs;

ArticleMock.find = (filter, cb) => {
    cb(...findCbArgs);
};

ArticleMock.save = (cb) => {
    cb(...saveCbArgs);
};

ArticleMock.findOneAndUpdate = (filter, doc, opts, cb) => {
    cb(...updateCbArgs);
};

ArticleMock.findByIdAndDelete = (filter, cb) => {
    cb(...deleteCbArgs);
};

chai.use(chaiHttp);

describe('app', () => {
    describe('GET /news', () => {  
        findCbArgs = [null, articlesMock];
        it('should return all articles', (done) => {
            chai.request(app)
                .get('/news')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.should.be.eql(articlesMock);
                    done();
                });
        });

        it('should return status 404 if there are no articles', (done) => {
            findCbArgs = [null, []];
            chai.request(app)
                .get('/news')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });

    describe('GET /news/:id', () => {            
        it('should return article by _id if it exists in the DB', (done) => {
            findCbArgs = [null, [articlesMock[0]]];
            chai.request(app)
                .get(`/news/1`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body[0].should.eql(articlesMock[0]);
                    done();
                });
        });

        it('should return status 404 if there is no article with privided _id in the DB', (done) => {
            findCbArgs = [null, []];
            chai.request(app)
                .get(`/news/1`)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('should return status 404 if the path is wrong', (done) => {
            chai.request(app)
                .get(`/new/1`)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });

    describe('POST /news', () => {            
        it('should return status 200 if a new article is successfully stored', (done) => {
            saveCbArgs = [null];
            chai.request(app)
                .post('/news')
                .send(articleMock)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });     
        
        it('should return status 400 if some error has occurred while storing new article', (done) => {
            saveCbArgs = [errorMessage];
            chai.request(app)
                .post('/news')
                .send(articleMock)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        }); 
    });  
    
    describe('PUT /news/:id', () => {            
        it('should return status 200 and return updated article', (done) => {
            updateCbArgs = [null, articleMock];
            chai.request(app)
                .put('/news/1')
                .send(articleMock)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.eql(articleMock);
                    done();
                });
        });   
        
        it('should return status 400 if some error has occurred', (done) => {
            updateCbArgs = [errorMessage, articleMock];
            chai.request(app)
                .put('/news/1')
                .send(articleMock)
                .end((err, res) => {
                    res.should.have.status(400);     
                    done();
                });
        });   

        it('should return status 400 if article cannot be found', (done) => {
            updateCbArgs = [errorMessage, null];
            chai.request(app)
                .put('/news/1')
                .send(articleMock)
                .end((err, res) => {
                    res.should.have.status(400);     
                    done();
                });
        });     
    });  

    describe('DELETE /news/:id', () => {
        it('should return status 200 and deleted article', (done) => {
            deleteCbArgs = [null, articleMock];
            chai.request(app)
                .delete('/news/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });   

        it('should return status 400 if article cannot be found', (done) => {
            deleteCbArgs = [null, null];
            chai.request(app)
                .delete('/news/1')
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });  

        it('should return status 400 if some error has occurred while deleting', (done) => {
            deleteCbArgs = [errorMessage, null];
            chai.request(app)
                .delete('/news/1')
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });  
});
