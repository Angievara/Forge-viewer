const fs = require('fs');
const APS = require('forge-apis');
const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_BUCKET } = require('../config.js');

let internalAuthClient = new APS.AuthClientTwoLegged(APS_CLIENT_ID, APS_CLIENT_SECRET, ['bucket:read', 'bucket:create', 'data:read', 'data:write', 'data:create'], true);
let publicAuthClient = new APS.AuthClientTwoLegged(APS_CLIENT_ID, APS_CLIENT_SECRET, ['viewables:read', 'data:read', 'account:read' ], true);

const service = module.exports = {};

async function getJSON(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
        alert('Could not load tree data. See console for more details.');
        console.error(await resp.text());
        return [];
    }
    return resp.json();
}

service.getInternalToken = async () => {
    if (!internalAuthClient.isAuthorized()) {
        await internalAuthClient.authenticate();
    }
    return internalAuthClient.getCredentials();
};

service.getPublicToken = async () => {
    if (!publicAuthClient.isAuthorized()) {
        await publicAuthClient.authenticate();
    }
    return publicAuthClient.getCredentials();
};

service.ensureBucketExists = async (bucketKey) => {
    try {
        await new APS.BucketsApi().getBucketDetails(bucketKey, null, await service.getInternalToken());
    } catch (err) {
        if (err.response.status === 404) {
            await new APS.BucketsApi().createBucket({ bucketKey, policyKey: 'persistent' }, {}, null, await service.getInternalToken());
        } else {
            throw err;
        }
    }
};

service.listObjects = async () => {
    await service.ensureBucketExists(APS_BUCKET);
    let resp = await new APS.ObjectsApi().getObjects(APS_BUCKET, { limit: 64 }, null, await service.getInternalToken());
    let objects = resp.body.items;
    while (resp.body.next) {
        const startAt = new URL(resp.body.next).searchParams.get('startAt');
        resp = await new APS.ObjectsApi().getObjects(APS_BUCKET, { limit: 64, startAt }, null, await service.getInternalToken());
        objects = objects.concat(resp.body.items);
    }
    return objects;
};

service.uploadObject = async (objectName, filePath) => {
    await service.ensureBucketExists(APS_BUCKET);
    const buffer = await fs.promises.readFile(filePath);
    const results = await new APS.ObjectsApi().uploadResources(
        APS_BUCKET,
        [{ objectKey: objectName, data: buffer }],
        { useAcceleration: false, minutesExpiration: 15 },
        null,
        await service.getInternalToken()
    );
    if (results[0].error) {
        throw results[0].completed;
    } else {
        return results[0].completed;
    }
};


service.translateObject = async (urn, rootFilename) => {
    const job = {
        input: { urn },
        output: { formats: [{ type: 'svf', views: ['2d', '3d'] }] }
    };
    if (rootFilename) {
        job.input.compressedUrn = true;
        job.input.rootFilename = rootFilename;
    }
    const resp = await new APS.DerivativesApi().translate(job, {}, null, await service.getInternalToken());
    return resp.body;
};

service.getManifest = async (urn) => {
    try {
        const resp = await new APS.DerivativesApi().getManifest(urn, {}, null, await service.getInternalToken());
        return resp.body;
    } catch (err) {
        if (err.response.status === 404) {
            return null;
        } else {
            throw err;
        }
    }
};

service.getProjectContents = async () =>{
    try{
        const publicToken = await service.getPublicToken();
        const projectId = "b.ff8371d5-e990-44f6-8d54-adc6eda4531d"
        let internalAuthClientt= new APS.AuthClientTwoLegged(APS_CLIENT_ID, APS_CLIENT_SECRET, ['bucket:read', 'bucket:create', 'data:read', 'data:write', 'data:create'], true);
        // const hub = await new APS.HubsApi().getHubs(null, internalAuthClientt, publicToken);
        // // console.log('hubs', hub.body.data)
        // const folders = await new APS.ProjectsApi().getProjectTopFolders(hub.body.data[0].id, projectId, internalAuthClientt, publicToken);
        // console.log('folders', folders.body.data)
        const folderId= 'urn:adsk.wipprod:fs.folder:co.g7sKvM0KRde7iF9-VIM1wA'
        const resp = await new APS.FoldersApi().getFolderContents(projectId, folderId, null, internalAuthClientt, publicToken);
        let items = []
        for(let i = 0; i < resp.body.data.length; i++){
            let item = await new APS.ItemsApi().getItemVersions(projectId,resp.body.data[i].id, null, internalAuthClient, publicToken)
            items.push(item.body.data[0])
        }
        return items;
    }catch(err){
            throw err;
    
    }
}

service.urnify = (id) => Buffer.from(id).toString('base64').replace(/=/g, '');