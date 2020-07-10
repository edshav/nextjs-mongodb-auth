import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'redux/root-reducer';
import { signOutSuccess } from 'redux/auth/actions';

export const logout = (): void => {
  window.localStorage.setItem('signout', JSON.stringify(Date.now()));
};

export const withAuthSync = (Component: NextPage): NextPage => {
  const Wrapper: NextPage = (props) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { viewer } = useSelector((state: AppState) => state.auth);

    useEffect(() => {
      if (viewer === null) {
        console.log({ viewer });
        router.push('/auth/signin');
      }
    }, [router, viewer]);

    useEffect(() => {
      const syncsignout = (event: StorageEvent): void => {
        if (event.key === 'signout') {
          dispatch(signOutSuccess(true));
        }
      };

      window.addEventListener('storage', syncsignout);

      return (): void => {
        window.removeEventListener('storage', syncsignout);
        window.localStorage.removeItem('signout');
      };
    }, [dispatch, router]);

    return viewer ? <Component {...props} /> : <h1>Loading...</h1>;
  };

  return Wrapper;
};
