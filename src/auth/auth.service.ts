import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import TokenPayload from './tokenPayload.interface';
import { google, Auth } from 'googleapis';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor (
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
		private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

    this.oauthClient = new google.auth.OAuth2(clientId, clientSecret);
  }
  
  oauthClient: Auth.OAuth2Client;

  async initUser(palette: string) {
    const user = await this.usersService.initUser(palette);
    const accessTokenCookie = this.getAccessTokenCookie(user.id);
    const refreshTokenCookie = await this.getRefreshTokenCookie(user.id, false);
    return {
      user,
      accessTokenCookie,
      refreshTokenCookie,
    }
  }

  async registerUser(userId: string, email: string, pass: string) {
    const user = await this.usersService.registerUser(userId, email, pass, false);
    await this.sendVerificationEmail(user.id, user.email);
    const accessTokenCookie = this.getAccessTokenCookie(user.id);
    const refreshTokenCookie = await this.getRefreshTokenCookie(user.id, true);
    return {
      user,
      accessTokenCookie,
      refreshTokenCookie,
    }
  }

  async loginUser(prevUserId: string, email: string, pass: string) {
    this.logoutUser(prevUserId);
    const user = await this.usersService.getUserByEmail(email);
    if (!user || !user.hashedPassword) {
      throw new BadRequestException('Invalid credentials');
    }
    const isMatching = await bcrypt.compare(pass, user.hashedPassword);
    if (!isMatching) {
      throw new BadRequestException('Invalid credentials');
    }
    const accessTokenCookie = this.getAccessTokenCookie(user.id);
    const refreshTokenCookie = await this.getRefreshTokenCookie(user.id, true);
    return {
      user,
      accessTokenCookie,
      refreshTokenCookie,
    };
  }

  async registerGoogleUser(userId: string, token: string) {
    const email = await this.googleAuthenticate(token);
    const user = await this.usersService.registerUser(userId, email, null, true);
    const accessTokenCookie = this.getAccessTokenCookie(user.id);
    const refreshTokenCookie = await this.getRefreshTokenCookie(user.id, true);
    return {
      user,
      accessTokenCookie,
      refreshTokenCookie,
    }
  }

  async loginGoogleUser(prevUserId: string | null, token: string) {
    if (prevUserId) {
      this.logoutUser(prevUserId);
    }
    const email = await this.googleAuthenticate(token);
    let user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('This user does not exist');
    }
    const accessTokenCookie = this.getAccessTokenCookie(user.id);
    const refreshTokenCookie = await this.getRefreshTokenCookie(user.id, true);
    return {
      user,
      accessTokenCookie,
      refreshTokenCookie,
    }
  }

  async logoutUser(userId: string) {
    await this.usersService.removeRefreshToken(userId);
    const accessTokenCookie = {
      name: 'Authentication',
      value: '',
      options: {
        httpOnly: false,
        path: '/',
        maxAge: 0,
      }
    };
    const refreshTokenCookie = {
      name: 'Refresh',
      value: '',
      options: {
        httpOnly: false,
        path: '/',
        maxAge: 0,
      }
    };
    return { accessTokenCookie, refreshTokenCookie};
  }

  async verifyUser(userId: string, code: string) {
    if (code.length !== 6) {
      throw new BadRequestException('Invalid verifcation code');
    }
    const user = await this.usersService.getUserById(userId);
    if (user.verifyEmailDate) {
      throw new BadRequestException('User email is already verified');
    }
    const isMatching = await bcrypt.compare(code, user.hashedEmailVerificationCode);
    if (!isMatching) {
      throw new BadRequestException('Invalid verifcation code');
    }
    return this.usersService.verifyUser(userId);
  }

  async resendUserVerification(userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (user.verifyEmailDate) {
      throw new BadRequestException('User email is already verified');
    }
    await this.sendVerificationEmail(userId, user.email);
    return user;
  }

  async googleAuthenticate(token: string) {
		const tokenInfo = await this.oauthClient.getTokenInfo(token);
    const userInfoClient = google.oauth2('v2').userinfo;
    this.oauthClient.setCredentials({
      access_token: token,
    });
    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });
    console.log(userInfoResponse.data);
		const email = tokenInfo.email;
    return email;
	}

  getAccessTokenCookie(userId: string) {
    const payload: TokenPayload = { userId };
		const expirationTime = this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${expirationTime}s`
    });
    return {
      name: 'Authentication',
      value: token,
      options: {
        httpOnly: false,
        path: '/',
        maxAge: parseInt(expirationTime) * 1000,
      }
    };
  }

  async getRefreshTokenCookie(userId: string, shouldTokenExpire: boolean) {
    const payload: TokenPayload = { userId };
		const expirationTime = this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: shouldTokenExpire 
        ? `${expirationTime}s`
        : '9999 years',
    });
    await this.usersService.setRefreshToken(userId, token);
    return {
      name: 'Refresh',
      value: token,
      options: {
        httpOnly: false,
        path: '/',
        maxAge: shouldTokenExpire
          ? parseInt(expirationTime) * 1000
          : 253402300000000,
      }
    }
  }
 
  async sendVerificationEmail(userId: string, userEmail: string) {
    const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    await this.usersService.setEmailVerificationCode(userId, code);
    console.log(code)
    return this.emailService.sendMail({
      from: 'Mindscape.pub <verify@mindscape.pub>',
      to: userEmail,
      subject: `Email verification code: ${code}`,
      text: `Welcome to Mindscape.pub! Use this code to verify your email: ${code}`
    });
  }
}
