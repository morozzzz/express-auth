/* eslint-disable */
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const should = chai.should();
const { User } = require('../schemas');

const UserMock = function() {
    return UserMock;
}
  
UserMock.findById = (props, cb) => {                
    cb(...findCbArgs)
}

UserMock.save = (cb) => {
    cb(...saveCbArgs);
}

const auth = proxyquire('../auth', {
    './schemas': {
        User: UserMock
    }
});

const accessTokenStub = 'cvasfvasasc';
const refreshTokenStub = 'sdsdasdasd';
const profileStub = {
    _id: '12',
    emails: ['sdsd@dsw.sd']
}
const errorMessage = 'error!';
const doneSpy = sinon.spy();
const redirectSpy = sinon.spy();
const nextSpy = sinon.spy();

let findCbArgs, saveCbArgs, isAuthenticated, req, res;

describe('auth', () => {
    beforeEach(() => {
        doneSpy.resetHistory();
    });
    describe('fbCallback', () => { 
        it('should call done() with error message if some eerror has occurred while finding user', () => {
            findCbArgs = [errorMessage, null];
            
            auth.fbCallback(accessTokenStub, refreshTokenStub, profileStub, doneSpy);
            doneSpy.calledWith(errorMessage).should.be.true;          
        });  

        it('should call done() with proper args if user exists in DB', () => {
            findCbArgs = [null, {}];
            
            auth.fbCallback(accessTokenStub, refreshTokenStub, profileStub, doneSpy);
            doneSpy.calledWith(null, false).should.be.true;          
        }); 

        it('should call done() with error message if some error has occurred while saving user', () => {
            findCbArgs = [null, null];
            saveCbArgs = [errorMessage];
            
            auth.fbCallback(accessTokenStub, refreshTokenStub, profileStub, doneSpy);
             
            doneSpy.calledWith(errorMessage).should.be.true;
        }); 

        it('should call done() with proper args if a new user has been successfully stored', () => {
            findCbArgs = [null, null];
            saveCbArgs = [null];
            
            auth.fbCallback(accessTokenStub, refreshTokenStub, profileStub, doneSpy);
             
            doneSpy.calledWith(null, UserMock).should.be.true;
        });
    });  

    describe('isLoggedIn ', () => { 
        beforeEach(() => {
            nextSpy.resetHistory();
            redirectSpy.resetHistory();
            req = {
                isAuthenticated: () => isAuthenticated,
                originalUrl: '/news',
                session: {}
            };
            res = {
                redirect: redirectSpy
            };
        });

        it('should call next() if user is authenticated', () => {
            isAuthenticated = true;
            
            auth.isLoggedIn(req, res, nextSpy);
            nextSpy.called.should.be.true;          
        }); 

        it('should set req.session.redirectTo to req.originalUrl if user is not authenticated', () => {
            isAuthenticated = false;
            
            auth.isLoggedIn(req, res, nextSpy);
            req.session.redirectTo === req.originalUrl;     
        }); 
    });      
});
