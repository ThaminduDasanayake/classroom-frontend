import { Cloudinary } from '@cloudinary/url-gen';
import { CLOUDINARY_CLOUD_NAME } from '@/constants';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { dpr, format, quality } from '@cloudinary/url-gen/actions/delivery';
import { source } from '@cloudinary/url-gen/actions/overlay';
import { text } from '@cloudinary/url-gen/qualifiers/source';
import { TextStyle } from '@cloudinary/url-gen/qualifiers/textStyle';
import { Position } from '@cloudinary/url-gen/qualifiers/position';
import { compass } from '@cloudinary/url-gen/qualifiers/gravity';

const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } });

export const bannerPhoto = (imageCldPubId: string, name: string) => {
  if (!imageCldPubId || !name) {
    throw new Error('imageCldPubId and name are required for bannerPhoto');
  }
  return cld
    .image(imageCldPubId)
    .resize(fill().width(800).height(200))
    .delivery(format('auto'))
    .delivery(quality('auto'))
    .delivery(dpr('auto'))
    .overlay(
      source(
        text(name, new TextStyle('roboto', 42).fontWeight('bold')).textColor('white'),
      ).position(new Position().gravity(compass('west')).offsetX(0.02)),
    );
};
