/**
 * @fileOverview Requirejs module containing the antie.widgets.Image class.
 * 
 * @preserve Copyright (c) 2013 British Broadcasting Corporation
 *           (http://www.bbc.co.uk) and TAL Contributors (1)
 * 
 * (1) TAL Contributors are listed in the AUTHORS file and at
 * https://github.com/fmtvp/TAL/AUTHORS - please extend this file, not this
 * notice.
 * 
 * @license Licensed under the Apache License, Version 2.0 (the "License"); you
 *          may not use this file except in compliance with the License. You may
 *          obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * 
 * All rights reserved Please contact us for an alternative licence
 */

require.def(
        'antie/widgets/glwidget',
        [
            'antie/lib/three.min',
            'antie/widgets/container',
            'antie/devices/device',
            'antie/devices/browserdevice',
            'antie/videosource',
            'antie/widgets/media',
        ],
        function(THREE, Container, Device, VideoSource, Media) {
            /**
             * The Image widget displays an image. It supports lazy
             * loading/unloading of images to conserve memory. You can
             * use CSS to set a background image on the container first
             * and then when the image specified in setSrc is loaded up
             * it will fill the <div> and obscure the background image.
             * 
             * @name antie.widgets.Image
             * @class
             * @extends antie.widgets.Container
             * @param {String}
             *            [id] The unique ID of the widget. If excluded,
             *            a temporary internal ID will be used (but not
             *            included in any output).
             * @param {String}
             *            src The image source URL.
             * @param {Size}
             *            size The size of the image.
             */
            var GLWidget = Container
                    .extend(/** @lends antie.widgets.GLWidget.prototype */
                    {
                        /**
                         * @constructor
                         * @ignore
                         */
                        init: function(id, size) {
                            this._super(id);
                            this._size = size;
                            this._imageElement = null;
                            this._renderMode = Image.RENDER_MODE_CONTAINER;
                            this.addClass('glwidget');
                            this._animating = false;
                            this._application = this.getCurrentApplication();
                            this._device = this._application.getDevice();

                            this.THREE = THREE;
                            this.camera = new THREE.PerspectiveCamera(75, this._size.width / this._size.height, 1, 10000);
                            this.camera.position.z = 1000;

                            this.scene = new THREE.Scene();

                            this.renderer = new THREE.WebGLRenderer();
                            this.renderer.setSize(this._size.width, this._size.height);

                            this._canvasElement = this.renderer.domElement;
                            this._canvasElement.style.width = size.width + "px";
                            this._canvasElement.style.height = size.height + "px";
                            this._canvasElement.id = this.id + "_can";
                        },
                        /**
                         * Renders the widget and any child widgets to
                         * device-specific output.
                         * 
                         * @param {antie.devices.Device}
                         *            device The device to render to.
                         * @returns A device-specific object that
                         *          represents the widget as displayed
                         *          on the device (in a browser, a
                         */
                        render: function(device) {
                            if (this._renderMode === GLWidget.RENDER_MODE_CONTAINER) {
                                this.outputElement = this._super(Device);
                                if (this._size) {
                                    device.setElementSize(this.outputElement, this._size);
                                }
                                device.prependChildElement(this.outputElement, this._canvasElement);
                            } else {
                                this.outputElement = this._canvasElement;
                            }

                            return this.outputElement;
                        },
                        /**
                         * The main animation loop
                         */
                        startAnimation: function() {

                            var self = this;
                            this._animating = true;

                            function animate() {
                                //Stop if necessary
                                if (!self._animating)
                                    return;

                                //Perform any actions requested by the application
                                if (self._callback)
                                    self._callback();

                                //Draw and repeat
                                requestAnimationFrame(animate);
                                self.renderer.render(self.scene, self.camera);
                            }
                            animate();
                        },
                        /**
                         * Set the function to be performed in the animation loop.
                         * @param {type} callback Function to perform each frame
                         */
                        setAnimCallback: function(callback) {
                            this._callback = callback;
                        },
                        /**
                         * Destroy the scene and remove the canvas.
                         */
                        dispose: function() {
                            this._animating = false;
                            this.camera = null;
                            this.renderer = null;
                            this.scene = null;

                            this._canvasElement.parentNode.removeChild(this._canvasElement);
                        },
                        /**
                         * Sets the render mode.
                         * 
                         * @param {String}
                         *            mode, The rendering mode.
                         */
                        setRenderMode: function(mode) {
                            this._renderMode = mode;
                        },
                        getRenderMode: function() {
                            return this._renderMode;
                        }

                    });
            Image.RENDER_MODE_IMG = 0;
            Image.RENDER_MODE_CONTAINER = 1;
            return GLWidget;
        });
