import { readFileSync } from 'fs';
import { join } from 'path';

const modelsDir = 'c:\\Users\\Waqas\\Documents\\F1Cars\\public\\models';
const files = ['1988-mclaren-mp4-4.glb', '2002-ferrari-f2002.glb', '2020-mercedes-amg-w11.glb', '2023-red-bull-rb19.glb'];

for (const file of files) {
  const buf = readFileSync(join(modelsDir, file));
  const jsonLen = buf.readUInt32LE(12);
  const jsonStr = buf.toString('utf8', 20, 20 + jsonLen);
  const gltf = JSON.parse(jsonStr);
  
  console.log(`\n========== ${file} ==========`);
  console.log(`File size: ${(buf.length / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Meshes: ${gltf.meshes?.length || 0}`);
  console.log(`Nodes: ${gltf.nodes?.length || 0}`);
  console.log(`Materials: ${gltf.materials?.length || 0}`);
  
  console.log('\n--- All Nodes ---');
  if (gltf.nodes) {
    gltf.nodes.forEach((node, i) => {
      const hasMesh = node.mesh !== undefined ? ` [mesh:${node.mesh}]` : '';
      const children = node.children ? ` children:[${node.children.join(',')}]` : '';
      console.log(`  [${i}] ${node.name || '(unnamed)'}${hasMesh}${children}`);
    });
  }
  
  console.log('\n--- All Meshes ---');
  if (gltf.meshes) {
    gltf.meshes.forEach((mesh, i) => {
      const primitiveCount = mesh.primitives?.length || 0;
      console.log(`  [${i}] ${mesh.name || '(unnamed)'} (${primitiveCount} primitives)`);
    });
  }
}
