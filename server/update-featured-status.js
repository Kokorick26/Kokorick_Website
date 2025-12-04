import dynamoDB from './db.js';

/**
 * Quick script to update featured status of projects
 * Usage: node server/update-featured-status.js
 */

const updateFeaturedStatus = async () => {
    console.log('\n🎯 Updating Featured Project Status\n');

    try {
        // First, get all projects
        const allData = await dynamoDB.scan({ TableName: 'Projects' }).promise();
        const projects = allData.Items;

        console.log(`Found ${projects.length} projects:\n`);
        projects.forEach((p, i) => {
            console.log(`${i + 1}. ${p.title}`);
            console.log(`   ID: ${p.id}`);
            console.log(`   Current Featured Status: ${p.featured || false}\n`);
        });

        // Example: Set only the first 2 projects as featured
        // MODIFY THIS SECTION based on which projects you want featured

        const projectsToFeature = [
            projects[0]?.id,  // First project
            projects[1]?.id,  // Second project
        ].filter(Boolean);

        const projectsToUnfeature = projects
            .slice(2)  // All projects after the first 2
            .map(p => p.id);

        console.log('📝 Planned Changes:');
        console.log(`   Will FEATURE: ${projectsToFeature.length} projects`);
        console.log(`   Will UNFEATURE: ${projectsToUnfeature.length} projects\n`);

        // Uncomment the following lines to actually apply the changes
        // WARNING: This will modify your database!

        /*
        // Set featured = true
        for (const id of projectsToFeature) {
            await dynamoDB.update({
                TableName: 'Projects',
                Key: { id },
                UpdateExpression: 'SET featured = :featured',
                ExpressionAttributeValues: {
                    ':featured': true
                }
            }).promise();
            const project = projects.find(p => p.id === id);
            console.log(`✅ Featured: ${project?.title}`);
        }
        
        // Set featured = false
        for (const id of projectsToUnfeature) {
            await dynamoDB.update({
                TableName: 'Projects',
                Key: { id },
                UpdateExpression: 'SET featured = :featured',
                ExpressionAttributeValues: {
                    ':featured': false
                }
            }).promise();
            const project = projects.find(p => p.id === id);
            console.log(`❌ Unfeatured: ${project?.title}`);
        }
        
        console.log('\n✨ Update complete!');
        */

        console.log('\n⚠️  DRY RUN MODE - No changes were made');
        console.log('📝 To apply changes, edit this file and uncomment the update code\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
};

updateFeaturedStatus();
