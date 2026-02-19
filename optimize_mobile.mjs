
import { NodeIO } from '@gltf-transform/core';
import { textureCompress, resample, prune, dedup, draco, join } from '@gltf-transform/functions';
import sharp from 'sharp';
import draco3d from 'draco3d';

const io = new NodeIO()
    .registerExtensions(draco3d.createDecoderModule())
    .registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule(),
    });

const main = async () => {
    console.log('Loading high-quality model...');
    const document = await io.read('public/models/colleseum_final.glb');

    console.log('Optimizing for Mobile (512px Textures)...');
    await document.transform(
        // Resize ALL textures to max 512px
        resample({ ready: sharp, width: 512, height: 512 }),

        // Remove unused data
        prune(),
        dedup(),

        // Draco Compression (Aggressive for mobile)
        draco({
            compressionLevel: 10,
            quantizePos: 11, // Slightly lower precision ok for mobile 
            quantizeNor: 8,
            quantizeTex: 8,
            quantizeCol: 8,
        })
    );

    console.log('Saving mobile model...');
    await io.write('public/models/colleseum_mobile.glb', document);
    console.log('Done: public/models/colleseum_mobile.glb');
};

main();
