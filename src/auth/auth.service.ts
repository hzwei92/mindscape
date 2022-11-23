import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import TokenPayload from './tokenPayload.interface';
import { google, Auth } from 'googleapis';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';

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

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      });
      const user = await this.usersService.getUserIfRefreshTokenMatches(payload.userId, token);
      if (!user) {
        throw new BadRequestException('Invalid refresh token');
      }
      return this.getAccessToken(user.id);
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new BadRequestException('Invalid refresh token');
      }
      throw error;
    }
  }

  async initUser(palette: string) {
    const user = await this.usersService.initUser(palette);
    const accessToken = this.getAccessToken(user.id);
    const refreshToken = await this.getRefreshToken(user.id, false);
    return {
      user,
      accessToken,
      refreshToken,
    }
  }

  async registerUser(userId: string, email: string, pass: string) {
    const user = await this.usersService.registerUser(userId, email, pass, false);
    await this.sendVerificationEmail(user, user.email);
    const accessToken = this.getAccessToken(user.id);
    const refreshToken = await this.getRefreshToken(user.id, true);
    return {
      user,
      accessToken,
      refreshToken,
    }
  }

  async loginUser(prevUser: User, email: string, pass: string) {
    await this.logoutUser(prevUser);

    const user = await this.usersService.getUserByEmail(email);
    if (!user || !user.hashedPassword) {
      throw new BadRequestException('Invalid credentials');
    }
    const isMatching = await bcrypt.compare(pass, user.hashedPassword);
    if (!isMatching) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.getAccessToken(user.id);
    const refreshToken = await this.getRefreshToken(user.id, true);
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async registerGoogleUser(user: User, token: string) {
    const email = await this.googleAuthenticate(token);
    const user1 = await this.usersService.registerUser(user.id, email, null, true);
    const accessToken = this.getAccessToken(user.id);
    const refreshToken = await this.getRefreshToken(user.id, true);
    return {
      user: user1,
      accessToken,
      refreshToken,
    }
  }

  async loginGoogleUser(prevUser: User, token: string) {
    if (prevUser) {
      this.logoutUser(prevUser);
    }
    const email = await this.googleAuthenticate(token);
    let user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('This user does not exist');
    }
    const accessToken = this.getAccessToken(user.id);
    const refreshToken = await this.getRefreshToken(user.id, true);
    return {
      user,
      accessToken,
      refreshToken,
    }
  }

  async logoutUser(user: User) {
    await this.usersService.removeRefreshToken(user.id);
  }

  async verifyUser(user: User, code: string) {
    if (code.length !== 6) {
      throw new BadRequestException('Invalid verifcation code');
    }
    if (user.verifyEmailDate) {
      throw new BadRequestException('User email is already verified');
    }
    const isMatching = await bcrypt.compare(code, user.hashedEmailVerificationCode);
    if (!isMatching) {
      throw new BadRequestException('Invalid verifcation code');
    }
    return this.usersService.verifyUser(user.id);
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

  getAccessToken(userId: string) {
    const payload: TokenPayload = { userId };
		const expirationTime = this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${expirationTime}s`
    });

    return token;
  }

  async getRefreshToken(userId: string, shouldTokenExpire: boolean) {
    const payload: TokenPayload = { userId };
		const expirationTime = this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: shouldTokenExpire 
        ? `${expirationTime}s`
        : '9999 years',
    });
    await this.usersService.setRefreshToken(userId, token);

    return token;
  }
 
  async sendVerificationEmail(user: User, userEmail: string) {
    const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    await this.usersService.setEmailVerificationCode(user.id, code);
    console.log(code)
    return this.emailService.sendMail({
      from: 'Mindscape.pub <verify@mindscape.pub>',
      to: userEmail,
      subject: `Email verification code: ${code}`,
      text: `Welcome to Mindscape.pub! Use this code to verify your email: ${code}`
    });
  }

  async resendUserVerification(user: User) {
    if (user.verifyEmailDate) {
      throw new BadRequestException('User email is already verified');
    }
    await this.sendVerificationEmail(user, user.email);
    return user;
  }
}
