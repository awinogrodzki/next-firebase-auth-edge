/* eslint-disable react/no-unescaped-entities */
import clsx from 'clsx';
import {ReactNode, useState} from 'react';

function Tab({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick(): void;
}) {
  return (
    <button
      className={clsx(
        'flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-slate-800 text-white'
          : 'bg-slate-800/40 text-slate-500 hover:bg-slate-800'
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

const files = [
  {
    name: 'middleware.ts',
    code: (
      <code
        className="nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10"
        dir="ltr"
        data-language="tsx"
        data-theme="default"
      >
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} NextRequest
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            NextResponse {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "next/server"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} authMiddleware
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            redirectToHome
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            redirectToLogin {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "next-firebase-auth-edge"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>export</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>async</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>function</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>middleware</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(request</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            NextRequest
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>) {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>return</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            authMiddleware
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>(request</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}loginPath
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "/api/login"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}logoutPath
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "/api/logout"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}apiKey</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "XXxxXxXXXxXxxxxx_XxxxXxxxxxXxxxXXXxxXxX"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}cookieName
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "AuthToken"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}cookieSignatureKeys
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> [</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "secret1"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "secret2"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>]</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}cookieSerializeOptions
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'      '}path</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "/"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}httpOnly
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>true</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}secure
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>false</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-comment)'}}>
            // Set this to true on HTTPS environments
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}sameSite
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "lax"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>as</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}maxAge
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>12</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>*</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>60</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>*</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>60</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>*</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>24</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-comment)'}}>
            // twelve days
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}
            {'}'}
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}serviceAccount
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}projectId
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "your-firebase-project-id"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}clientEmail
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "firebase-adminsdk-nnw48@your-firebase-project-id.iam.gserviceaccount.com"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}privateKey
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}
            {'}'}
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}
            {'}'});
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'}</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>export</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>config</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}matcher</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> [</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "/api/login"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "/api/logout"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "/"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "/((?!_next|favicon.ico|api|.*\\.).*)"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>]</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'};</span>
        </span>
      </code>
    )
  },
  {
    name: 'AuthContext.ts',
    code: (
      <code
        className="nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10"
        dir="ltr"
        data-language="tsx"
        data-theme="default"
      >
        <span className="line">
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "use client"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} createContext
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            useContext {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "react"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>type</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} UserInfo {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "firebase/auth"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} Claims {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "next-firebase-auth-edge/lib/auth/claims"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>export</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>interface</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>User</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>extends</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>Omit</span>
          <span style={{color: 'var(--shiki-color-text)'}}>&lt;</span>
          <span style={{color: 'var(--shiki-token-function)'}}>UserInfo</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "providerId"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt; {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}emailVerified
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>boolean</span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}customClaims
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>Claims</span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'}</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>export</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>interface</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            AuthContextValue
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}user</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>User</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>|</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>null</span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'}</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>export</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            AuthContext
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            createContext
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&lt;</span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            AuthContextValue
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;({'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}user</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>null</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'});</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>export</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>useAuth</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> () </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=&gt;</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>useContext</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(AuthContext);</span>
        </span>
      </code>
    )
  },
  {
    name: 'AuthProvider.tsx',
    code: (
      <code
        className="nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10"
        dir="ltr"
        data-language="tsx"
        data-theme="default"
      >
        <span className="line">
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "use client"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>*</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>as</span>
          <span style={{color: 'var(--shiki-color-text)'}}> React </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "react"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'} getAuth</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> IdTokenResult</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            onIdTokenChanged
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> User </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>as</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            FirebaseUser {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "firebase/auth"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} filterStandardClaims {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "next-firebase-auth-edge/lib/auth/claims"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} AuthContext
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> User {'}'} </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "./AuthContext"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>export</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>interface</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            AuthProviderProps
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}serverUser
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>User</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>|</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>null</span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}children</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>React</span>
          <span style={{color: 'var(--shiki-color-text)'}}>.</span>
          <span style={{color: 'var(--shiki-token-function)'}}>ReactNode</span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'}</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>function</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>toUser</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(user</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            FirebaseUser
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> idTokenResult</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            IdTokenResult
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>)</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>User</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>return</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>...</span>
          <span style={{color: 'var(--shiki-color-text)'}}>user</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}customClaims
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            filterStandardClaims
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            idTokenResult
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>.claims)</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}
            {'}'};
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'}</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>export</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            AuthProvider
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>React</span>
          <span style={{color: 'var(--shiki-color-text)'}}>.</span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            FunctionComponent
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&lt;</span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            AuthProviderProps
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt; </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> ({'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}serverUser
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}children</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'}) </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=&gt;</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> [</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>user</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>setUser</span>
          <span style={{color: 'var(--shiki-color-text)'}}>] </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>React</span>
          <span style={{color: 'var(--shiki-token-function)'}}>.useState</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(serverUser);</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            handleIdTokenChanged
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>async</span>
          <span style={{color: 'var(--shiki-color-text)'}}> (firebaseUser</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            FirebaseUser
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>|</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>null</span>
          <span style={{color: 'var(--shiki-color-text)'}}>) </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=&gt;</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>if</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            (firebaseUser) {'{'}
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'      '}</span>
          <span style={{color: 'var(--shiki-token-function)'}}>setUser</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span style={{color: 'var(--shiki-token-function)'}}>toUser</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(firebaseUser</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>await</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            firebaseUser
          </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            .getIdTokenResult
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>()));</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'      '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>return</span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}
            {'}'}
          </span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-token-function)'}}>setUser</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>null</span>
          <span style={{color: 'var(--shiki-color-text)'}}>);</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}
            {'}'};
          </span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>React</span>
          <span style={{color: 'var(--shiki-token-function)'}}>.useEffect</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(() </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=&gt;</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>return</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            onIdTokenChanged
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span style={{color: 'var(--shiki-token-function)'}}>getAuth</span>
          <span style={{color: 'var(--shiki-color-text)'}}>()</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            handleIdTokenChanged);
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}
            {'}'}
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> []);</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>return</span>
          <span style={{color: 'var(--shiki-color-text)'}}> (</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}&lt;</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            AuthContext.Provider
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'      '}</span>
          <span style={{color: 'var(--shiki-token-function)'}}>value</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'{'}
            {'{'}
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'        '}user
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}
            {'}'}
            {'}'}
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}&gt;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}
            {'{'}children{'}'}
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}&lt;/</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            AuthContext.Provider
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '});</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'};</span>
        </span>
      </code>
    )
  },
  {
    name: 'layout.tsx',
    code: (
      <code
        className="nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10"
        dir="ltr"
        data-language="tsx"
        data-theme="default"
      >
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} Metadata {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "next"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} filterStandardClaims {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "next-firebase-auth-edge/lib/auth/claims"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'} Tokens</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            getTokens {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "next-firebase-auth-edge"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} cookies {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "next/headers"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} User {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "./AuthContext"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'} AuthProvider {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "./AuthProvider"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>toUser</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            ({'{'} decodedToken {'}'}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>Tokens</span>
          <span style={{color: 'var(--shiki-color-text)'}}>)</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>User</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=&gt;</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>uid</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>email</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}picture:{' '}
          </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>photoURL</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}email_verified:{' '}
          </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            emailVerified
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}phone_number:{' '}
          </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            phoneNumber
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}name: </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            displayName
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}
            {'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> decodedToken;</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            customClaims
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            filterStandardClaims
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            (decodedToken);
          </span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>return</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}uid</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}email</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> email </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>??</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>null</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}displayName
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> displayName </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>??</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>null</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}photoURL
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> photoURL </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>??</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>null</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}phoneNumber
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> phoneNumber </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>??</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>null</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}emailVerified
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            emailVerified{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>??</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>false</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}customClaims
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}
            {'}'};
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'};</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>export</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>default</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>async</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>function</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>RootLayout</span>
          <span style={{color: 'var(--shiki-color-text)'}}>({'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}children</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}children</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>JSX</span>
          <span style={{color: 'var(--shiki-color-text)'}}>.</span>
          <span style={{color: 'var(--shiki-token-function)'}}>Element</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'}'}) {'{'}
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>tokens</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>await</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>getTokens</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span style={{color: 'var(--shiki-token-function)'}}>cookies</span>
          <span style={{color: 'var(--shiki-color-text)'}}>()</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}apiKey</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            'XXxxXxXXXxXxxxxx_XxxxXxxxxxXxxxXXXxxXxX'
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}cookieName
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            'AuthToken'
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}cookieSignatureKeys
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> [</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            'secret1'
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            'secret2'
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>]</span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}serviceAccount
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}projectId
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            'your-firebase-project-id'
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}clientEmail
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'        '}</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            'firebase-adminsdk-nnw48@your-firebase-project-id.iam.gserviceaccount.com'
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}privateKey
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'        '}</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}
            {'}'}
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'  '}
            {'}'});
          </span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>user</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> tokens </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>?</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>toUser</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(tokens) </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>null</span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        {'\n'}
        <span className="line"> </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>return</span>
          <span style={{color: 'var(--shiki-color-text)'}}> (</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}&lt;</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            html
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>lang</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "en"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'      '}&lt;</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            head
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> /&gt;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'      '}&lt;</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            body
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'        '}&lt;
          </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            main
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'          '}&lt;
          </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            AuthProvider
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>serverUser</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'{'}user{'}'}&gt;{'{'}children{'}'}&lt;/
          </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>
            AuthProvider
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'        '}&lt;/
          </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            main
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}&lt;/
          </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            body
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}&lt;/</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            html
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '});</span>
        </span>
        {'\n'}
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'}</span>
        </span>
      </code>
    )
  }
];

export default function HeroCode() {
  const [fileIndex, setFileIndex] = useState(0);

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-md bg-gradient-to-tr from-sky-300 via-sky-300/70 to-blue-300 opacity-10 blur-lg" />
      <div className="absolute inset-0 rounded-md bg-gradient-to-tr from-sky-300 via-sky-300/70 to-blue-300 opacity-10" />
      <div className="relative rounded-md bg-[#0A101F]/80 ring-1 ring-white/10 backdrop-blur">
        <div className="absolute -top-px right-10 h-px w-1/2 bg-gradient-to-r from-sky-300/0 via-sky-300/40 to-sky-300/0" />
        <div className="p-4">
          <svg
            aria-hidden="true"
            className="h-2.5 w-auto"
            fill="none"
            viewBox="0 0 42 10"
          >
            <circle className="fill-slate-800" cx={5} cy={5} r="4.5" />
            <circle className="fill-slate-800" cx={21} cy={5} r="4.5" />
            <circle className="fill-slate-800" cx={37} cy={5} r="4.5" />
          </svg>
          <div className="mt-4 flex space-x-2 overflow-x-auto">
            {files.map((file) => (
              <Tab
                key={file.name}
                active={fileIndex === files.indexOf(file)}
                onClick={() => setFileIndex(files.indexOf(file))}
              >
                {file.name}
              </Tab>
            ))}
          </div>
          <div className="mt-6 flex items-start lg:min-h-[260px] lg:w-[684px]">
            <pre className="ml-[-16px] flex overflow-x-auto px-0" data-theme>
              {files[fileIndex].code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
