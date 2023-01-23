const queries = require('./queries');

module.exports = {

    isManager: async (userID, projectName) =>
    {
        const managingProjs = await queries.getProjectByProjMgrID(userID);
        for (var k=0; k < managingProjs.length; k++)
        {
            if (managingProjs[k].projectName == projectName)
            {
            console.log(managingProjs[k].projectName)
            console.log(projectName)
            return true;
            }
        }
        return false;
    },

    isAuthor: (userID, authorID) =>
    {
        return userID.equals(authorID);
    },

    isReviewer: (assignedReviewers_ids, userID) =>
    {
        return assignedReviewers_ids.includes(userID);
    },

    isProjectUser: (userProjects, projectName) =>
    {
        return userProjects.includes(projectName);
    }

}
