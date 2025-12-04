#!/usr/bin/env node

/**
 * Test script to verify the /featured endpoint fix
 * This tests that the route order is correct and featured projects are returned
 */

const API_BASE = 'http://localhost:5000';

async function testEndpoints() {
    console.log('\n🧪 Testing Featured Projects API Fix\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Get all projects
        console.log('\n📊 Test 1: GET /api/projects (all projects)');
        const allResponse = await fetch(`${API_BASE}/api/projects`);
        const allProjects = await allResponse.json();
        console.log(`✅ Status: ${allResponse.status}`);
        console.log(`✅ Total projects: ${allProjects.length}`);

        // Test 2: Get featured projects
        console.log('\n⭐ Test 2: GET /api/projects/featured (featured only)');
        const featuredResponse = await fetch(`${API_BASE}/api/projects/featured`);
        const featuredProjects = await featuredResponse.json();
        console.log(`✅ Status: ${featuredResponse.status}`);
        console.log(`✅ Featured projects: ${featuredProjects.length}`);

        // Verify featured projects
        console.log('\n🔍 Verification:');
        const allFeaturedCount = allProjects.filter(p => p.featured === true).length;
        console.log(`   Projects with featured=true in database: ${allFeaturedCount}`);
        console.log(`   Projects returned by /featured endpoint: ${featuredProjects.length}`);

        if (allFeaturedCount === featuredProjects.length) {
            console.log('   ✅ MATCH! Featured endpoint is working correctly');
        } else {
            console.log('   ❌ MISMATCH! Featured endpoint may have issues');
        }

        // Display featured projects
        console.log('\n📋 Featured Projects List:');
        featuredProjects.forEach((project, index) => {
            console.log(`   ${index + 1}. ${project.title}`);
            console.log(`      Featured: ${project.featured}`);
            console.log(`      Tags: ${project.tags?.join(', ') || 'N/A'}`);
            console.log('');
        });

        // Display all projects for comparison
        console.log('📋 All Projects List:');
        allProjects.forEach((project, index) => {
            const icon = project.featured ? '⭐' : '  ';
            console.log(`   ${icon} ${index + 1}. ${project.title} (featured: ${project.featured || false})`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('✅ Test Complete!\n');

        // Final summary
        if (featuredProjects.length > 0) {
            console.log('🎉 SUCCESS: Featured projects are being returned correctly!');
            console.log('   The route order fix is working.');
        } else {
            console.log('⚠️  WARNING: No featured projects returned.');
            console.log('   Check if any projects have featured=true in the database.');
        }

    } catch (error) {
        console.error('\n❌ Error testing endpoints:');
        console.error(error.message);
        console.log('\n💡 Make sure the backend server is running on port 5000');
        console.log('   Run: npm run server\n');
    }
}

// Run the test
testEndpoints();
