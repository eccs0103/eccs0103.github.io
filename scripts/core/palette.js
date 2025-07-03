"use strict";
const { min, max, trunc, abs } = Math;
//#region Color
/**
 * Color class to handle color conversions and manipulations.
 */
class Color {
    //#region Color formats
    /**
     * RGB color format.
     * @readonly
     */
    static get RGB_FORMAT() {
        return 0;
    }
    /**
     * HSL color format.
     * @readonly
     */
    static get HSL_FORMAT() {
        return 1;
    }
    /**
     * HEX color format.
     * @readonly
     */
    static get HEX_FORMAT() {
        return 2;
    }
    //#endregion
    //#region Converters
    static #toChannel(offset, hue, saturation, lightness) {
        const sector = (offset + hue) % 12;
        return lightness - (saturation * min(lightness, 1 - lightness)) * min(sector - 3, 9 - sector).clamp(-1, 1);
    }
    /**
     * @param hsl [0 - 360], [0 - 100], [0 - 100]
     * @param rgb [0 - 255], [0 - 255], [0 - 255]
     */
    static #HSLtoRGB(hsl, rgb) {
        const hue = hsl[0] / 30;
        const saturation = hsl[1] / 100;
        const lightness = hsl[2] / 100;
        rgb[0] = Color.#toChannel(0, hue, saturation, lightness) * 255;
        rgb[1] = Color.#toChannel(8, hue, saturation, lightness) * 255;
        rgb[2] = Color.#toChannel(4, hue, saturation, lightness) * 255;
    }
    static #toHue(maximum, red, green, blue, difference) {
        switch (maximum) {
            case red: return (green - blue) / difference + 0;
            case green: return (blue - red) / difference + 2;
            case blue: return (red - green) / difference + 4;
            default: throw new Error(`Invalid ${maximum} maximum value`);
        }
    }
    /**
     * @param rgb [0 - 255], [0 - 255], [0 - 255]
     * @param hsl [0 - 360], [0 - 100], [0 - 100]
     */
    static #RGBtoHSL(rgb, hsl) {
        const red = rgb[0] / 255;
        const green = rgb[1] / 255;
        const blue = rgb[2] / 255;
        const minimum = min(red, green, blue);
        const maximum = max(red, green, blue);
        const difference = maximum - minimum;
        let hue = this.#toHue(maximum, red, green, blue, difference);
        hue = difference && hue;
        if (hue < 0)
            hue += 6;
        hsl[0] = hue * 60;
        const median = 1 - abs(maximum + minimum - 1);
        hsl[1] = (median && (difference / median)) * 100;
        hsl[2] = (maximum + minimum) / 2 * 100;
    }
    static #toHEXString(number) {
        return number.toString(16).padStart(2, `0`);
    }
    //#endregion
    //#region Presets
    /**
     * Transparent color preset.
     * @readonly
     */
    static get newTransparent() { return Color.fromRGB(0, 0, 0, 0); }
    ;
    /**
     * Maroon color preset.
     * @readonly
     */
    static get newMaroon() { return Color.fromRGB(128, 0, 0); }
    ;
    /**
     * Red color preset.
     * @readonly
     */
    static get newRed() { return Color.fromRGB(255, 0, 0); }
    ;
    /**
     * Orange color preset.
     * @readonly
     */
    static get newOrange() { return Color.fromRGB(255, 165, 0); }
    ;
    /**
     * Yellow color preset.
     * @readonly
     */
    static get newYellow() { return Color.fromRGB(255, 255, 0); }
    ;
    /**
     * Olive color preset.
     * @readonly
     */
    static get newOlive() { return Color.fromRGB(128, 128, 0); }
    ;
    /**
     * Green color preset.
     * @readonly
     */
    static get newGreen() { return Color.fromRGB(0, 128, 0); }
    ;
    /**
     * Purple color preset.
     * @readonly
     */
    static get newPurple() { return Color.fromRGB(128, 0, 128); }
    ;
    /**
     * Fuchsia color preset.
     * @readonly
     */
    static get newFuchsia() { return Color.fromRGB(255, 0, 255); }
    ;
    /**
     * Lime color preset.
     * @readonly
     */
    static get newLime() { return Color.fromRGB(0, 255, 0); }
    ;
    /**
     * Teal color preset.
     * @readonly
     */
    static get newTeal() { return Color.fromRGB(0, 128, 128); }
    ;
    /**
     * Aqua color preset.
     * @readonly
     */
    static get newAqua() { return Color.fromRGB(0, 255, 255); }
    ;
    /**
     * Blue color preset.
     * @readonly
     */
    static get newBlue() { return Color.fromRGB(0, 0, 255); }
    ;
    /**
     * Navy color preset.
     * @readonly
     */
    static get newNavy() { return Color.fromRGB(0, 0, 128); }
    ;
    /**
     * Black color preset.
     * @readonly
     */
    static get newBlack() { return Color.fromRGB(0, 0, 0); }
    ;
    /**
     * Gray color preset.
     * @readonly
     */
    static get newGray() { return Color.fromRGB(128, 128, 128); }
    ;
    /**
     * Silver color preset.
     * @readonly
     */
    static get newSilver() { return Color.fromRGB(192, 192, 192); }
    ;
    /**
     * White color preset.
     * @readonly
     */
    static get newWhite() { return Color.fromRGB(255, 255, 255); }
    ;
    //#endregion
    //#region Builders
    static #patternRGB = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
    static #patternRGBA = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\S+)\s*\)$/i;
    static #patternHSL = /^hsl\(\s*(\d+)(?:deg)?\s*,\s*(\d+)(?:%)?\s*,\s*(\d+)(?:%)?\s*\)$/i;
    static #patternHSLA = /^hsla\(\s*(\d+)(?:deg)?\s*,\s*(\d+)(?:%)?\s*,\s*(\d+)(?:%)?\s*,\s*(\S+)\s*\)$/i;
    static #patternHEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
    static #patternHEXA = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
    /**
     * Parses a string representation of a color into a Color object.
     * @param string The string representation of the color.
     * @param deep Indicates whether the color representation includes alpha channel.
     * @param format The format of the string representation.
     * @throws {SyntaxError} If the provided string has invalid syntax for the specified format.
     */
    static parseAs(string, deep = true, format = Color.RGB_FORMAT) {
        switch (format) {
            case Color.RGB_FORMAT:
                {
                    const regex = (deep ? Color.#patternRGBA : Color.#patternRGB);
                    const match = regex.exec(string.trim());
                    if (match === null)
                        throw new SyntaxError(`Invalid ${format} color '${string}' syntax`);
                    const [, red, green, blue, alpha] = match.map(part => Number(part));
                    return Color.fromRGB(red, green, blue, deep ? alpha : 1);
                }
                ;
            case Color.HSL_FORMAT:
                {
                    const regex = (deep ? Color.#patternHSLA : Color.#patternHSL);
                    const match = regex.exec(string.trim());
                    if (match === null)
                        throw new SyntaxError(`Invalid ${format} color '${string}' syntax`);
                    const [, hue, saturation, lightness, alpha] = match.map(part => Number(part));
                    return Color.fromHSL(hue, saturation, lightness, deep ? alpha : 1);
                }
                ;
            case Color.HEX_FORMAT:
                {
                    const regex = (deep ? Color.#patternHEXA : Color.#patternHEX);
                    const match = regex.exec(string.trim());
                    if (match === null)
                        throw new SyntaxError(`Invalid ${format} color '${string}' syntax`);
                    const [, red, green, blue, alpha] = match.map(part => Number.parseInt(part, 16));
                    return Color.fromRGB(red, green, blue, deep ? (alpha / 255) : 1);
                }
                ;
            default: throw new TypeError(`Invalid ${format} color format`);
        }
    }
    static #patterns = [Color.RGB_FORMAT, Color.HSL_FORMAT, Color.HEX_FORMAT].flatMap(format => [[format, false], [format, true]]);
    /**
     * Parses a color string in any format and returns a Color object.
     * @param string The string representation of the color.
     * @throws {SyntaxError} If the color string is invalid.
     */
    static parse(string) {
        for (const [format, deep] of Color.#patterns) {
            try {
                return Color.parseAs(string, deep, format);
            }
            catch {
                continue;
            }
        }
        throw new SyntaxError(`Unable to parse '${string}' of any existing format`);
    }
    /**
     * Creates a Color object from RGB values.
     * @param red The red value [0 - 255].
     * @param green The green value [0 - 255].
     * @param blue The blue value [0 - 255].
     * @param alpha The alpha value [0 - 1].
     * @throws {TypeError} If any value is not finite.
     */
    static fromRGB(red, green, blue, alpha = 1) {
        if (!Number.isFinite(red))
            throw new TypeError(`The red ${red} must be a finite number`);
        if (!Number.isFinite(green))
            throw new TypeError(`The green ${green} must be a finite number`);
        if (!Number.isFinite(blue))
            throw new TypeError(`The blue ${blue} must be a finite number`);
        if (!Number.isFinite(alpha))
            throw new TypeError(`The alpha ${alpha} must be a finite number`);
        const color = new Color();
        color.#rgb[0] = red;
        color.#rgb[1] = green;
        color.#rgb[2] = blue;
        color.#alpha = alpha.clamp(0, 1);
        Color.#RGBtoHSL(color.#rgb, color.#hsl);
        return color;
    }
    /**
     * Creates a Color object from HSL values.
     * @param hue The hue value [0 - 360).
     * @param saturation The saturation value [0 - 100].
     * @param lightness The lightness value [0 - 100].
     * @param alpha The alpha value [0 - 1].
     * @throws {TypeError} If any value is not finite.
     */
    static fromHSL(hue, saturation, lightness, alpha = 1) {
        if (!Number.isFinite(hue))
            throw new TypeError(`The hue ${hue} must be a finite number`);
        if (!Number.isFinite(saturation))
            throw new TypeError(`The saturation ${saturation} must be a finite number`);
        if (!Number.isFinite(lightness))
            throw new TypeError(`The lightness ${lightness} must be a finite number`);
        if (!Number.isFinite(alpha))
            throw new TypeError(`The alpha ${alpha} must be a finite number`);
        const color = new Color();
        hue %= 360;
        if (hue < 0)
            hue += 360;
        color.#hsl[0] = hue;
        color.#hsl[1] = saturation.clamp(0, 100);
        color.#hsl[2] = lightness.clamp(0, 100);
        color.#alpha = alpha.clamp(0, 1);
        Color.#HSLtoRGB(color.#hsl, color.#rgb);
        return color;
    }
    constructor(arg1) {
        if (arg1 instanceof Color) {
            this.#rgb = Uint8ClampedArray.from(arg1.#rgb);
            this.#hsl = Uint16Array.from(arg1.#hsl);
            this.#alpha = arg1.alpha;
            return;
        }
        if (typeof (arg1) === `undefined`) {
            this.#rgb = new Uint8ClampedArray([0, 0, 0]);
            this.#hsl = new Uint16Array([0, 0, 0]);
            this.#alpha = 1;
            return;
        }
        throw new TypeError(`No overload with (${[arg1].map(typename).join(`, `)}) arguments`);
    }
    //#endregion
    //#region Methods
    /**
     * Mixes two colors based on a given ratio.
     * @param first The first color to mix.
     * @param second The second color to mix.
     * @param ratio The ratio of the mix [0 - 1].
     * @returns The mixed color new instance.
     * @throws {TypeError} If the ratio is not finite.
     */
    static mix(first, second, ratio = 0.5) {
        return new Color(first).mix(second, ratio);
    }
    /**
     * Converts a color to grayscale.
     * @param source The color to convert to grayscale.
     * @param scale The scale of the conversion [0 - 1].
     * @returns The grayscale color new instance.
     * @throws {TypeError} If the scale is not finite.
     */
    static grayscale(source, scale = 1) {
        return new Color(source).grayscale(scale);
    }
    /**
     * Emphasizes the red component of a color.
     * @param source The color to emphasize red.
     * @param scale The scale of the emphasis [0 - 1].
     * @returns The red-emphasized color new instance.
     * @throws {TypeError} If the scale is not finite.
     */
    static redEmphasis(source, scale = 1) {
        return new Color(source).redEmphasis(scale);
    }
    /**
     * Emphasizes the green component of a color.
     * @param source The color to emphasize green.
     * @param scale The scale of the emphasis [0 - 1].
     * @returns The green-emphasized color new instance.
     * @throws {TypeError} If the scale is not finite.
     */
    static greenEmphasis(source, scale = 1) {
        return new Color(source).greenEmphasis(scale);
    }
    /**
     * Emphasizes the blue component of a color.
     * @param source The color to emphasize blue.
     * @param scale The scale of the emphasis [0 - 1].
     * @returns The blue-emphasized color new instance.
     * @throws {TypeError} If the scale is not finite.
     */
    static blueEmphasis(source, scale = 1) {
        return new Color(source).blueEmphasis(scale);
    }
    /**
     * Inverts a color.
     * @param source The color to invert.
     * @param scale The scale of the inversion [0 - 1].
     * @returns The inverted color new instance.
     * @throws {TypeError} If the scale is not finite.
     */
    static invert(source, scale = 1) {
        return new Color(source).invert(scale);
    }
    /**
     * Applies a sepia tone effect to a color.
     * @param source The color to apply the sepia effect to.
     * @param scale The scale of the effect [0 - 1].
     * @returns The sepia color new instance.
     * @throws {TypeError} If the scale is not finite.
     */
    static sepia(source, scale = 1) {
        return new Color(source).sepia(scale);
    }
    /**
     * Rotates the hue of a color.
     * @param source The color to rotate.
     * @param angle The angle of rotation.
     * @returns The rotated color new instance.
     * @throws {TypeError} If the angle is not finite.
     */
    static rotate(source, angle) {
        return new Color(source).rotate(angle);
    }
    /**
     * Saturates a color.
     * @param source The color to saturate.
     * @param scale The scale of saturation [0 - 1].
     * @returns The saturated color new instance.
     * @throws {TypeError} If the scale is not finite.
     */
    static saturate(source, scale) {
        return new Color(source).saturate(scale);
    }
    /**
     * Illuminates a color.
     * @param source The color to illuminate.
     * @param scale The scale of illumination [0 - 1].
     * @returns The illuminated color new instance.
     * @throws {TypeError} If the scale is not finite.
     */
    static illuminate(source, scale) {
        return new Color(source).illuminate(scale);
    }
    /**
     * Changes the alpha transparency of a color.
     * @param source The color to change the transparency of.
     * @param scale The scale of transparency [0 - 1].
     * @returns The passed color new instance.
     * @throws {TypeError} If the scale is not finite.
     */
    static pass(source, scale) {
        return new Color(source).pass(scale);
    }
    //#endregion
    //#region Properties
    #rgb;
    /**
     * Gets the red color component.
     */
    get red() {
        return this.#rgb[0];
    }
    /**
     * Sets the red color component.
     */
    set red(value) {
        if (!Number.isFinite(value))
            return;
        this.#rgb[0] = value;
        Color.#RGBtoHSL(this.#rgb, this.#hsl);
    }
    /**
     * Gets the green color component.
     */
    get green() {
        return this.#rgb[1];
    }
    /**
     * Sets the green color component.
     */
    set green(value) {
        if (!Number.isFinite(value))
            return;
        this.#rgb[1] = value;
        Color.#RGBtoHSL(this.#rgb, this.#hsl);
    }
    /**
     * Gets the blue color component.
     */
    get blue() {
        return this.#rgb[2];
    }
    /**
     * Sets the blue color component.
     */
    set blue(value) {
        if (!Number.isFinite(value))
            return;
        this.#rgb[2] = value;
        Color.#RGBtoHSL(this.#rgb, this.#hsl);
    }
    #hsl;
    /**
     * Gets the hue color component.
     */
    get hue() {
        return this.#hsl[0];
    }
    /**
     * Sets the hue color component.
     */
    set hue(value) {
        if (!Number.isFinite(value))
            return;
        this.#hsl[0] = value.modulate(360);
        Color.#HSLtoRGB(this.#hsl, this.#rgb);
    }
    /**
     * Gets the saturation color component.
     */
    get saturation() {
        return this.#hsl[1];
    }
    /**
     * Sets the saturation color component.
     */
    set saturation(value) {
        if (!Number.isFinite(value))
            return;
        this.#hsl[1] = value.clamp(0, 100);
        Color.#HSLtoRGB(this.#hsl, this.#rgb);
    }
    /**
     * Gets the lightness color component.
     */
    get lightness() {
        return this.#hsl[2];
    }
    /**
     * Sets the lightness color component.
     */
    set lightness(value) {
        if (!Number.isFinite(value))
            return;
        this.#hsl[2] = value.clamp(0, 100);
        Color.#HSLtoRGB(this.#hsl, this.#rgb);
    }
    #alpha;
    /**
     * Gets the alpha color component.
     */
    get alpha() {
        return this.#alpha;
    }
    /**
     * Sets the alpha color component.
     */
    set alpha(value) {
        if (!Number.isFinite(value))
            return;
        this.#alpha = value.clamp(0, 1);
    }
    //#endregion
    //#region Modifiers
    /**
     * Converts the color to a string representation in the specified format.
     * @param deep Whether to include alpha channel.
     * @param format The format to convert the color to.
     */
    toString(deep = true, format = Color.RGB_FORMAT) {
        switch (format) {
            case Color.RGB_FORMAT: return `rgb${deep ? `a` : String.empty}(${this.red}, ${this.green}, ${this.blue}${deep ? `, ${this.alpha}` : String.empty})`;
            case Color.HSL_FORMAT: return `hsl${deep ? `a` : String.empty}(${this.hue}deg, ${this.saturation}%, ${this.lightness}%${deep ? `, ${this.alpha}` : String.empty})`;
            case Color.HEX_FORMAT: return `#${Color.#toHEXString(this.red)}${Color.#toHEXString(this.green)}${Color.#toHEXString(this.blue)}${deep ? Color.#toHEXString(trunc(this.alpha * 255)) : String.empty}`;
            default: throw new TypeError(`Invalid '${format}' color format`);
        }
    }
    /**
     * Mixes the current color with another color based on a given ratio.
     * @param other The color to mix with.
     * @param ratio The ratio of the mix [0 - 1].
     * @returns The current color.
     * @throws {TypeError} If the ratio is not finite.
     */
    mix(other, ratio = 0.5) {
        if (!Number.isFinite(ratio))
            throw new TypeError(`The ratio ${ratio} must be a finite number`);
        ratio = ratio.clamp(0, 1);
        this.red += (other.red - this.red) * ratio;
        this.green += (other.green - this.green) * ratio;
        this.blue += (other.blue - this.blue) * ratio;
        return this;
    }
    /**
     * Converts the current color to grayscale.
     * @param scale The scale of the conversion [0 - 1].
     * @returns The current color.
     * @throws {TypeError} If the scale is not finite.
     */
    grayscale(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        const achromatic = (this.red + this.green + this.blue) / 3;
        this.red += (achromatic - this.red) * scale;
        this.green += (achromatic - this.green) * scale;
        this.blue += (achromatic - this.blue) * scale;
        return this;
    }
    /**
     * Emphasizes the red component of the current color.
     * @param scale The scale of the emphasis [0 - 1].
     * @returns The current color instance.
     * @throws {TypeError} If the scale is not finite.
     */
    redEmphasis(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        const average = (this.green + this.blue) / 2;
        this.green += (average - this.green) * scale;
        this.blue += (average - this.blue) * scale;
        return this;
    }
    /**
     * Emphasizes the green component of the current color.
     * @param scale The scale of the emphasis [0 - 1].
     * @returns The current color instance.
     * @throws {TypeError} If the scale is not finite.
     */
    greenEmphasis(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        const average = (this.red + this.blue) / 2;
        this.red += (average - this.red) * scale;
        this.blue += (average - this.blue) * scale;
        return this;
    }
    /**
     * Emphasizes the blue component of the current color.
     * @param scale The scale of the emphasis [0 - 1].
     * @returns The current color instance.
     * @throws {TypeError} If the scale is not finite.
     */
    blueEmphasis(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        const average = (this.red + this.green) / 2;
        this.red += (average - this.red) * scale;
        this.green += (average - this.green) * scale;
        return this;
    }
    /**
     * Inverts the current color.
     * @param scale The scale of the inversion [0 - 1].
     * @returns The current color.
     * @throws {TypeError} If the scale is not finite.
     */
    invert(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.red += ((255 - this.red) - this.red) * scale;
        this.green += ((255 - this.green) - this.green) * scale;
        this.blue += ((255 - this.blue) - this.blue) * scale;
        return this;
    }
    /**
     * Applies a sepia tone effect to the current color.
     * @param scale The scale of the sepia effect [0 - 1].
     * @returns The current color.
     * @throws {TypeError} If the scale is not finite.
     */
    sepia(scale = 1) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        const redness = (this.red * 0.393) + (this.green * 0.769) + (this.blue * 0.189);
        const greenness = (this.red * 0.349) + (this.green * 0.686) + (this.blue * 0.168);
        const blueness = (this.red * 0.272) + (this.green * 0.534) + (this.blue * 0.131);
        this.red += (redness - this.red) * scale;
        this.green += (greenness - this.green) * scale;
        this.blue += (blueness - this.blue) * scale;
        return this;
    }
    /**
     * Rotates the hue of the current color.
     * @param angle The angle by which to rotate the hue.
     * @returns The current color.
     * @throws {TypeError} If the angle is not finite.
     */
    rotate(angle) {
        if (!Number.isFinite(angle))
            throw new TypeError(`The angle ${angle} must be a finite number`);
        this.hue += angle;
        return this;
    }
    /**
     * Saturates the current color by increasing its saturation.
     * @param scale The scale of saturation increase [0 - 1].
     * @returns The current color.
     * @throws {TypeError} If the scale is not finite.
     */
    saturate(scale) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.saturation = 100 * scale;
        return this;
    }
    /**
     * Illuminates the current color by increasing its lightness.
     * @param scale The scale of lightness increase [0 - 1].
     * @returns The current color.
     * @throws {TypeError} If the scale is not finite.
     */
    illuminate(scale) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.lightness = 100 * scale;
        return this;
    }
    /**
     * Passes the current color through a filter, adjusting its alpha channel.
     * @param scale The scale of alpha channel adjustment [0 - 1].
     * @returns The current color.
     * @throws {TypeError} If the scale is not finite.
     */
    pass(scale) {
        if (!Number.isFinite(scale))
            throw new TypeError(`The scale ${scale} must be a finite number`);
        scale = scale.clamp(0, 1);
        this.alpha = scale;
        return this;
    }
}
//#endregion
export { Color };
