import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { config } from '../../../config';
import { authService } from '../auth.service';

if (config.oauth.github.clientId && config.oauth.github.clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.oauth.github.clientId,
        clientSecret: config.oauth.github.clientSecret,
        callbackURL: config.oauth.github.callbackUrl,
        scope: ['user:email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: (error: Error | null, user?: any) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value || `${profile.id}@github.placeholder`;

          const user = await authService.findOrCreateOAuthUser(
            'github',
            profile.id,
            email,
            profile.displayName || profile.username,
            profile.photos?.[0]?.value,
            _accessToken
          );

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
