// Test utilities for role-based authentication
// Run these in browser console after signing in

// Extend Window interface for TypeScript
declare global {
  interface Window {
    authTests: {
      checkSession: () => Promise<any>;
      testRoleRedirects: () => Promise<void>;
      testLoginFlow: () => Promise<void>;
      testMiddleware: () => Promise<void>;
      displayUserInfo: () => Promise<void>;
      runAllTests: () => Promise<void>;
    };
  }
}

/**
 * Check current user session and role
 */
async function checkSession() {
  const response = await fetch('/api/auth/session');
  const session = await response.json();
  
  console.log('=== Session Info ===');
  console.log('User:', session.user);
  console.log('Email:', session.user?.email);
  console.log('Role:', session.user?.role);
  console.log('User ID:', session.user?.id);
  console.log('Is Admin:', session.user?.role === 'admin');
  
  return session;
}

/**
 * Test role-based redirects
 */
async function testRoleRedirects() {
  const session = await checkSession();
  const role = session.user?.role;
  
  console.log('\n=== Testing Redirects ===');
  console.log(`Current role: ${role}`);
  console.log(`Expected redirect after login: ${role === 'admin' ? '/admin' : '/account'}`);
  
  // Test access to protected routes
  console.log('\nTesting route access:');
  
  // Test admin route
  try {
    const adminResponse = await fetch('/admin');
    console.log(`/admin - Status: ${adminResponse.status} ${adminResponse.ok ? '✅' : '❌'}`);
    if (role !== 'admin' && adminResponse.ok) {
      console.warn('⚠️ Non-admin has admin access - security issue!');
    }
  } catch (e) {
    console.log('/admin - Error accessing route');
  }
  
  // Test account route
  try {
    const accountResponse = await fetch('/account');
    console.log(`/account - Status: ${accountResponse.status} ${accountResponse.ok ? '✅' : '❌'}`);
  } catch (e) {
    console.log('/account - Error accessing route');
  }
}

/**
 * Simulate login flow and check redirect
 */
async function testLoginFlow() {
  const session = await checkSession();
  
  if (!session.user) {
    console.log('Not signed in. Please sign in first.');
    return;
  }
  
  console.log('\n=== Login Flow Test ===');
  console.log('If you just signed in, you should have been redirected to:');
  console.log(session.user.role === 'admin' ? '→ /admin (Admin Dashboard)' : '→ /account (User Account)');
  console.log(`Current location: ${window.location.pathname}`);
  
  if (session.user.role === 'admin' && window.location.pathname === '/account') {
    console.warn('⚠️ Admin redirected to /account instead of /admin');
  }
  
  if (session.user.role === 'user' && window.location.pathname.startsWith('/admin')) {
    console.error('❌ SECURITY ISSUE: Regular user has access to admin routes!');
  }
}

/**
 * Test middleware protection
 */
async function testMiddleware() {
  console.log('\n=== Middleware Protection Test ===');
  
  const testRoutes = [
    { path: '/admin', shouldAccess: 'admin-only' },
    { path: '/admin/perfumes', shouldAccess: 'admin-only' },
    { path: '/account', shouldAccess: 'authenticated' },
    { path: '/', shouldAccess: 'public' }
  ];
  
  const session = await checkSession();
  const role = session.user?.role;
  
  for (const route of testRoutes) {
    try {
      const response = await fetch(route.path);
      const accessible = response.ok && !response.url.includes('/SignIn');
      
      let expected = false;
      if (route.shouldAccess === 'public') expected = true;
      else if (route.shouldAccess === 'authenticated') expected = !!session.user;
      else if (route.shouldAccess === 'admin-only') expected = role === 'admin';
      
      const status = accessible === expected ? '✅' : '❌';
      console.log(`${route.path} - ${status} (accessible: ${accessible}, expected: ${expected})`);
      
      if (accessible !== expected) {
        console.warn(`⚠️ ${route.path} - Protection mismatch!`);
      }
    } catch (e) {
      console.error(`${route.path} - Error:`, e);
    }
  }
}

/**
 * Display user info in a nice format
 */
async function displayUserInfo() {
  const session = await checkSession();
  
  if (!session.user) {
    console.log('%c👤 Not Signed In', 'font-size: 20px; color: #ef4444;');
    return;
  }
  
  const roleColor = session.user.role === 'admin' ? '#10b981' : '#3b82f6';
  const roleIcon = session.user.role === 'admin' ? '👑' : '👤';
  
  console.log(`%c${roleIcon} ${session.user.name || 'User'}`, `font-size: 24px; color: ${roleColor}; font-weight: bold;`);
  console.log(`%cEmail: ${session.user.email}`, 'font-size: 14px; color: #6b7280;');
  console.log(`%cRole: ${session.user.role.toUpperCase()}`, `font-size: 14px; color: ${roleColor}; font-weight: bold;`);
  console.log(`%cUser ID: ${session.user.id}`, 'font-size: 12px; color: #9ca3af;');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.clear();
  console.log('%c🧪 Role-Based Auth Testing Suite', 'font-size: 24px; font-weight: bold; color: #8b5cf6;');
  console.log('%c────────────────────────────────────', 'color: #8b5cf6;');
  
  await displayUserInfo();
  console.log('\n');
  await testLoginFlow();
  await testMiddleware();
  
  console.log('\n%c✅ Testing Complete!', 'font-size: 18px; font-weight: bold; color: #10b981;');
  console.log('\nQuick Commands:');
  console.log('- checkSession() - View current session');
  console.log('- displayUserInfo() - Pretty display of user info');
  console.log('- testMiddleware() - Test route protection');
  console.log('- testLoginFlow() - Test login redirect logic');
  console.log('- runAllTests() - Run complete test suite');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.authTests = {
    checkSession,
    testRoleRedirects,
    testLoginFlow,
    testMiddleware,
    displayUserInfo,
    runAllTests
  };
  
  console.log('%c🔧 Auth Test Utilities Loaded', 'font-size: 16px; font-weight: bold; color: #3b82f6;');
  console.log('Available commands:');
  console.log('- authTests.runAllTests() - Run complete test suite');
  console.log('- authTests.checkSession() - Check current session');
  console.log('- authTests.displayUserInfo() - Display user info');
  console.log('- authTests.testMiddleware() - Test route protection');
}

export {
  checkSession,
  testRoleRedirects,
  testLoginFlow,
  testMiddleware,
  displayUserInfo,
  runAllTests
};
