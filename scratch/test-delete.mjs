// Test script to debug DELETE audit functionality
// Run with: node scratch/test-delete.mjs

const BASE_URL = 'http://127.0.0.1:4000';

async function testDelete() {
    console.log('--- Testing DELETE audit endpoint ---\n');
    
    // Step 1: Get audits list first
    console.log('1. Fetching audits list...');
    const auditsRes = await fetch(`${BASE_URL}/api/audits`, { redirect: 'manual' });
    console.log('   Status:', auditsRes.status, 'Type:', auditsRes.headers.get('content-type'));
    
    if (auditsRes.status === 307 || auditsRes.status === 308 || auditsRes.status === 302 || auditsRes.status === 301) {
        console.log('   REDIRECTED to:', auditsRes.headers.get('location'));
        console.log('   => This means the request is being redirected by middleware (no session cookie).');
        console.log('   => From browser with cookie, the API should work. Check browser console for error.');
        return;
    }
    
    try {
        const audits = await auditsRes.json();
        console.log('   Got', audits.length, 'audits');
        
        if (audits.length > 0) {
            const testAudit = audits[0];
            console.log('   Test audit ID:', testAudit._id, 'Name:', testAudit.name);
            
            // Step 2: Try DELETE (will likely fail without auth)
            console.log('\n2. Trying DELETE on audit:', testAudit._id);
            const deleteRes = await fetch(`${BASE_URL}/api/audits/${testAudit._id}`, { 
                method: 'DELETE',
                redirect: 'manual'
            });
            console.log('   Status:', deleteRes.status);
            console.log('   Content-Type:', deleteRes.headers.get('content-type'));
            console.log('   Location:', deleteRes.headers.get('location'));
            
            if (deleteRes.status === 307 || deleteRes.status === 308) {
                console.log('   => MIDDLEWARE is redirecting the DELETE request!');
                console.log('   => This will also happen from browser if session cookie is invalid.');
            } else {
                const body = await deleteRes.text();
                console.log('   Body:', body.substring(0, 500));
            }
        }
    } catch (e) {
        const text = await auditsRes.text();
        console.log('   Not JSON. Body (first 200 chars):', text.substring(0, 200));
    }
}

testDelete().catch(console.error);
