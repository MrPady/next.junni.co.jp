import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as CANNON from 'cannon';

import wallVert from './shaders/wall.vs';
import wallFrag from './shaders/wall.fs';

export type PhysicsData = {
	body: CANNON.Body,
	mesh: THREE.Mesh
}

export class Wall extends THREE.Object3D {

	private cannonWorld: CANNON.World;
	private commonUniforms: ORE.Uniforms;

	private physics: PhysicsData[] = [];

	constructor( cannonWorld: CANNON.World, parentUniforms: ORE.Uniforms ) {

		super();

		this.cannonWorld = cannonWorld;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			tex: window.gManager.assetManager.getTex( 'topLogo' )
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		let globalSize = new THREE.Vector3( 7, 4, 0.2 );
		let res = new THREE.Vector2( globalSize.x, globalSize.y ).multiplyScalar( 4 );
		let size = new THREE.Vector2( globalSize.x / res.x, globalSize.y / res.y );

		let material = new THREE.ShaderMaterial( {
			vertexShader: wallVert,
			fragmentShader: wallFrag,
			uniforms: this.commonUniforms,
		} );

		for ( let i = 0; i < res.x; i ++ ) {

			for ( let j = 0; j < res.y; j ++ ) {

				let geo = new THREE.BoxBufferGeometry( size.x, size.y, globalSize.z );

				let uv = geo.getAttribute( 'uv' );
				uv.applyMatrix4( new THREE.Matrix4().makeScale( 1.0 / res.x, 1.0 / res.y, 1 ) );
				uv.applyMatrix4( new THREE.Matrix4().makeTranslation( 1.0 / res.x * i, 1.0 / res.y * j, 0.0 ) );


				let boxMesh = new THREE.Mesh( geo, material );
				this.add( boxMesh );

				let boxBody = new CANNON.Body( {
					mass: 1,
					allowSleep: true,
				} );

				boxBody.sleep();
				boxBody.sleepSpeedLimit = 0.1;
				boxBody.sleepTimeLimit = 1;

				// @ts-ignore
				boxBody.name = i + '-' + j;
				boxBody.position.set( i * size.x - globalSize.x / 2, j * size.y - globalSize.y / 2 + 1.2, globalSize.z );
				boxBody.addShape( new CANNON.Box( new CANNON.Vec3( size.x / 2, size.y / 2, globalSize.z ) ) );

				this.cannonWorld.addBody( boxBody );

				this.physics.push( {
					mesh: boxMesh,
					body: boxBody
				} );

			}

		}

	}

	public update( deltaTime: number ) {

		for ( let i = 0; i < this.physics.length; i ++ ) {

			let mesh = this.physics[ i ].mesh;
			let body = this.physics[ i ].body;

			mesh.position.copy( body.position as unknown as THREE.Vector3 );
			mesh.quaternion.copy( body.quaternion as unknown as THREE.Quaternion );

		}

	}

}
