import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import * as oauthService from '../services/oauth.service';
import { env } from '../config/env';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshTokenPair(req.body.refreshToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logoutUser(req.body.refreshToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.verifyEmail(String(req.query.token ?? ''));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function resendVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.resendVerification(req.body.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export function googleRedirect(_req: Request, res: Response) {
  res.redirect(oauthService.getGoogleAuthUrl());
}

export async function googleCallback(req: Request, res: Response) {
  try {
    const code = String(req.query.code ?? '');
    const profile = await oauthService.exchangeGoogleCode(code);
    const result = await authService.loginWithOAuth('google', profile);
    const redirectUrl = `${env.FRONTEND_URL}/oauth/callback?access=${result.accessToken}&refresh=${result.refreshToken}`;
    res.redirect(redirectUrl);
  } catch {
    res.redirect(`${env.FRONTEND_URL}/login?oauthError=google`);
  }
}

export function githubRedirect(_req: Request, res: Response) {
  res.redirect(oauthService.getGithubAuthUrl());
}

export async function githubCallback(req: Request, res: Response) {
  try {
    const code = String(req.query.code ?? '');
    const profile = await oauthService.exchangeGithubCode(code);
    const result = await authService.loginWithOAuth('github', profile);
    const redirectUrl = `${env.FRONTEND_URL}/oauth/callback?access=${result.accessToken}&refresh=${result.refreshToken}`;
    res.redirect(redirectUrl);
  } catch {
    res.redirect(`${env.FRONTEND_URL}/login?oauthError=github`);
  }
}