"use strict";
import { Matrix, Vector2D } from "../core/measures.js";
import { Color } from "../core/palette.js";
import "../worker/extensions.js";
const { trunc } = Math;
//#region Texture
/**
 * Represents a texture.
 */
class Texture extends Matrix {
    //#region Converters
    /**
     * Converts the texture to ImageData.
     * @param texture The texture to convert.
     * @returns The converted ImageData.
     */
    static toImageData(texture) {
        const size = texture.size;
        const imageData = new ImageData(size.x, size.y);
        const data = imageData.data;
        const position = Vector2D.newNaN;
        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {
                position.x = x;
                position.y = y;
                const index = size.x * y + x;
                const color = texture.get(position);
                data[index * 4 + 0] = color.red;
                data[index * 4 + 1] = color.green;
                data[index * 4 + 2] = color.blue;
                data[index * 4 + 3] = trunc(color.alpha * 255);
            }
        }
        return imageData;
    }
    /**
     * Creates a texture from ImageData.
     * @param imageData The ImageData to create the texture from.
     * @returns The created texture.
     */
    static fromImageData(imageData) {
        const size = new Vector2D(imageData.width, imageData.height);
        const texture = new Texture(size);
        const data = imageData.data;
        const position = Vector2D.newNaN;
        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {
                position.x = x;
                position.y = y;
                const index = size.x * y + x;
                const color = Color.fromRGB(data[index * 4 + 0], data[index * 4 + 1], data[index * 4 + 2], data[index * 4 + 3] / 255);
                texture.set(position, color);
            }
        }
        return texture;
    }
    constructor(arg1) {
        if (arg1 instanceof Texture) {
            super(arg1.size, () => Color.newTransparent);
            const position = Vector2D.newNaN;
            for (let y = 0; y < arg1.size.y; y++) {
                for (let x = 0; x < arg1.size.x; x++) {
                    position.x = x;
                    position.y = y;
                    this.set(position, new Color(arg1.get(position)));
                }
            }
            return;
        }
        if (arg1 instanceof Vector2D) {
            super(arg1, () => Color.newTransparent);
            return;
        }
        throw new TypeError(`No overload with (${[arg1].map(typename).join(`, `)}) arguments`);
    }
    //#endregion
    //#region Methods
    /**
     * Mixes two textures.
     * @param first The first texture.
     * @param second The second texture.
     * @param ratio The ratio of mixing [0 - 1].
     * @returns The mixed new texture.
     * @throws {TypeError} If the ratio is not finite.
     */
    static mix(first, second, ratio = 0.5) {
        return new Texture(first).mix(second, ratio);
    }
    /**
     * Converts the texture to grayscale.
     * @param source The source texture.
     * @param scale The scale of the grayscale effect [0 - 1].
     * @returns The grayscale new texture.
     * @throws {TypeError} If the scale is not finite.
     */
    static grayscale(source, scale = 1) {
        return new Texture(source).grayscale(scale);
    }
    /**
     * Enhances the red component of the texture.
     * @param source The source texture.
     * @param scale The scale of the red emphasis [0 - 1].
     * @returns The red-emphasized new texture.
     * @throws {TypeError} If the scale is not finite.
     */
    static redEmphasis(source, scale = 1) {
        return new Texture(source).redEmphasis(scale);
    }
    /**
     * Enhances the green component of the texture.
     * @param source The source texture.
     * @param scale The scale of the green emphasis [0 - 1].
     * @returns The green-emphasized new texture.
     * @throws {TypeError} If the scale is not finite.
     */
    static greenEmphasis(source, scale = 1) {
        return new Texture(source).greenEmphasis(scale);
    }
    /**
     * Enhances the blue component of the texture.
     * @param source The source texture.
     * @param scale The scale of the blue emphasis [0 - 1].
     * @returns The blue-emphasized new texture.
     * @throws {TypeError} If the scale is not finite.
     */
    static blueEmphasis(source, scale = 1) {
        return new Texture(source).blueEmphasis(scale);
    }
    /**
     * Inverts the colors of the texture.
     * @param source The source texture.
     * @param scale The scale of the inversion effect [0 - 1].
     * @returns The inverted new texture.
     * @throws {TypeError} If the scale is not finite.
     */
    static invert(source, scale = 1) {
        return new Texture(source).invert(scale);
    }
    /**
     * Applies sepia effect to the texture.
     * @param source The source texture.
     * @param scale The scale of the sepia effect [0 - 1].
     * @returns The new texture with sepia effect.
     * @throws {TypeError} If the scale is not finite.
     */
    static sepia(source, scale = 1) {
        return new Texture(source).sepia(scale);
    }
    /**
     * Rotates the hue of the texture.
     * @param source The source texture.
     * @param angle The angle of rotation.
     * @returns The rotated new texture.
     * @throws {TypeError} If the angle is not finite.
     */
    static rotate(source, angle) {
        return new Texture(source).rotate(angle);
    }
    /**
     * Saturates the colors of the texture.
     * @param source The source texture.
     * @param scale The scale of saturation effect [0 - 1].
     * @returns The saturated new texture.
     * @throws {TypeError} If the scale is not finite.
     */
    static saturate(source, scale) {
        return new Texture(source).saturate(scale);
    }
    /**
     * Illuminates the texture.
     * @param source The source texture.
     * @param scale The scale of illumination [0 - 1].
     * @returns The illuminated new texture.
     * @throws {TypeError} If the scale is not finite.
     */
    static illuminate(source, scale) {
        return new Texture(source).illuminate(scale);
    }
    /**
     * Sets the transparency of the texture.
     * @param source The source texture.
     * @param scale The scale of transparency [0 - 1].
     * @returns The new texture with transparency.
     * @throws {TypeError} If the scale is not finite.
     */
    static pass(source, scale) {
        return new Texture(source).pass(scale);
    }
    //#endregion
    //#region Modifiers
    /**
     * Iterates over each pixel in the texture and applies a callback function.
     * @param callback
     * @returns
     */
    forEach(callback) {
        return super.forEach(callback);
    }
    /**
     * Mixes this texture with another texture.
     * @param other The other texture to mix.
     * @param ratio The ratio of mixing [0 - 1].
     * @returns The current texture.
     * @throws {TypeError} If the ratio is not finite.
     */
    mix(other, ratio = 0.5) {
        if (!Number.isFinite(ratio))
            throw new TypeError(`The ratio ${ratio} must be a finite number`);
        ratio = ratio.clamp(0, 1);
        this.forEach((pixel, position) => pixel.mix(other.get(position), ratio));
        return this;
    }
    /**
     * Converts the current texture to grayscale.
     * @param scale The scale of the grayscale effect [0 - 1].
     * @returns The current texture.
     * @throws {TypeError} If the scale is not finite.
     */
    grayscale(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.forEach(pixel => pixel.grayscale(scale));
        return this;
    }
    /**
     * Enhances the red component of the current texture.
     * @param scale The scale of the red emphasis [0 - 1].
     * @returns The current texture.
     * @throws {TypeError} If the scale is not finite.
     */
    redEmphasis(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.forEach(pixel => pixel.redEmphasis(scale));
        return this;
    }
    /**
     * Enhances the green component of the current texture.
     * @param scale The scale of the green emphasis [0 - 1].
     * @returns The current texture.
     * @throws {TypeError} If the scale is not finite.
     */
    greenEmphasis(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.forEach(pixel => pixel.greenEmphasis(scale));
        return this;
    }
    /**
     * Enhances the blue component of the current texture.
     * @param scale The scale of the blue emphasis [0 - 1].
     * @returns The current texture.
     * @throws {TypeError} If the scale is not finite.
     */
    blueEmphasis(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.forEach(pixel => pixel.blueEmphasis(scale));
        return this;
    }
    /**
     * Inverts the colors of the current texture.
     * @param scale The scale of the inversion effect [0 - 1].
     * @returns The current texture.
     * @throws {TypeError} If the scale is not finite.
     */
    invert(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.forEach(pixel => pixel.invert(scale));
        return this;
    }
    /**
     * Applies sepia effect to the current texture.
     * @param scale The scale of the sepia effect [0 - 1].
     * @returns The current texture.
     * @throws {TypeError} If the scale is not finite.
     */
    sepia(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.forEach(pixel => pixel.sepia(scale));
        return this;
    }
    /**
     * Rotates the hue of the current texture.
     * @param angle The angle of rotation.
     * @returns The current texture.
     * @throws {TypeError} If the angle is not finite.
     */
    rotate(angle) {
        if (!Number.isFinite(angle))
            throw new TypeError(`The angle ${angle} must be a finite number`);
        this.forEach(pixel => pixel.rotate(angle));
        return this;
    }
    /**
     * Saturates the colors of the current texture.
     * @param scale The scale of saturation effect [0 - 1].
     * @returns The current texture.
     * @throws {TypeError} If the scale is not finite.
     */
    saturate(scale) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.forEach(pixel => pixel.saturate(scale));
        return this;
    }
    /**
     * Illuminates the current texture.
     * @param scale The scale of illumination [0 - 1].
     * @returns The current texture.
     * @throws {TypeError} If the scale is not finite.
     */
    illuminate(scale) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.forEach(pixel => pixel.illuminate(scale));
        return this;
    }
    /**
     * Sets the transparency of the current texture.
     * @param scale The scale of transparency [0 - 1].
     * @returns The current texture.
     * @throws {TypeError} If the scale is not finite.
     */
    pass(scale) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.forEach(pixel => pixel.pass(scale));
        return this;
    }
}
;
//#endregion
export { Texture };
