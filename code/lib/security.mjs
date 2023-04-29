import jwt from 'jwt-simple'

const SECRET = process.env.SECRET;

function dateToSec(date = new Date()) {
    return Math.floor(date.getTime() / 1000);
}

function secToDate(s) {
    return new Date(s * 1000);
}

export function createToken(user) {
    const DAYS = 10;
    const exp = new Date();
    exp.setDate(exp.getDate() + DAYS);

    const payload = {
        iss: process.env.ISSUER,
        iat: dateToSec(),
        exp: dateToSec(exp),
        sub: user.id,
        user: {
            id: user.id,
            name: user.name,
            login: user.login,
            email: user.email,
            roles: user.roles.map(r => r.name)
        }
    }
    return jwt.encode(payload, SECRET);
}

function hasAnyRole(user, roles = []) {
    if (roles.size === 0) return true;
    if (!user || !user.roles) return false;
    return user.roles.some(r => roles.includes(r))
}


function expandClaims(token) {
    const coersed = {...token};
    if (token.sub) {
        coersed.subject = token.sub;
        delete coersed.sub;
    }
    if (token.iss) {
        coersed.issuer = token.iss;
        delete coersed.iss;
    }
    if (coersed.exp) {
        coersed.expiration = secToDate(token.exp);
        delete coersed.exp;
    }
    if (coersed.iat) {
        coersed.issuedAt = secToDate(token.iat);
        delete coersed.iat;
    }
    if (coersed.aud) {
        coersed.audience = token.aud;
        delete coersed.aud;
    }
    if (coersed.nbf) {
        coersed.notBefore = secToDate(token.nbf);
        delete coersed.nbf;
    }
    if (coersed.jti) {
        coersed.jwtId = coersed.jti;
        delete coersed.jti;
    }
    return coersed;
}

export function decode(bearerStr, noVerify = false) {
    if (!bearerStr) return {}
    return expandClaims(jwt.decode(bearerStr.replace("Bearer ", ""), SECRET, noVerify))
}

export function JWT_SECURITY(req, scopes=[]) {
    if (scopes.size === 0) scopes.push('USER');
    const token = decode(req.header("Authorization"));

    if (!token.user || token.issuer !== process.env.ISSUER) {
        throw {status: 401, message: 'Unauthorized'}
    }

    if (!hasAnyRole(token.user, scopes)) {
        throw {
            status: 401, 
            message: 'Unauthorized' +
            process.env.NODE_ENV !== 'Production' ? 
                `. Roles: [${token.user.roles}] Needed: [${scopes}]` :''
        }
    }

    req.token = token;
    req.user = token.user;
    return true;
}