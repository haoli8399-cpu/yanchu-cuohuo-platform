import crypto from 'node:crypto';

const TENCENT_ASR_ENDPOINT = 'https://asr.tencentcloudapi.com';
const TENCENT_ASR_HOST = 'asr.tencentcloudapi.com';
const TENCENT_ASR_SERVICE = 'asr';
const TENCENT_ASR_ACTION = 'SentenceRecognition';
const TENCENT_ASR_VERSION = '2019-06-14';
const MAX_AUDIO_BYTES = 3 * 1024 * 1024;

interface TencentAsrResponse {
  Response?: {
    Result?: string;
    Error?: {
      Code?: string;
      Message?: string;
    };
    RequestId?: string;
  };
}

export async function speechToText(audioBuffer: Buffer, filename: string): Promise<string> {
  const secretId = process.env.TENCENT_ASR_SECRET_ID || '';
  const secretKey = process.env.TENCENT_ASR_SECRET_KEY || '';

  if (!secretId || !secretKey) {
    throw new Error('未配置语音识别服务：请设置 TENCENT_ASR_SECRET_ID 和 TENCENT_ASR_SECRET_KEY');
  }
  if (!audioBuffer.length) {
    throw new Error('音频文件为空');
  }
  if (audioBuffer.length > MAX_AUDIO_BYTES) {
    throw new Error('音频文件过大，请控制在 3MB 以内');
  }

  return tencentSentenceRecognition(audioBuffer, filename, secretId, secretKey);
}

async function tencentSentenceRecognition(
  audioBuffer: Buffer,
  filename: string,
  secretId: string,
  secretKey: string
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const region = process.env.TENCENT_ASR_REGION || 'ap-shanghai';
  const payload = JSON.stringify({
    SubServiceType: 2,
    ProjectId: 0,
    EngSerViceType: process.env.TENCENT_ASR_ENGINE || '16k_zh',
    VoiceFormat: getVoiceFormat(filename),
    SourceType: 1,
    Data: audioBuffer.toString('base64'),
    DataLen: audioBuffer.length,
    FilterDirty: 0,
    FilterModal: 1,
    FilterPunc: 0,
    ConvertNumMode: 1,
    HotwordList: '喜剧工厂|10,脱口秀|10,即兴喜剧|10,漫才|10,商演|8,年会|8,团建|8',
  });

  const headers = buildTencentHeaders({
    payload,
    timestamp,
    region,
    secretId,
    secretKey,
  });

  const res = await fetch(TENCENT_ASR_ENDPOINT, {
    method: 'POST',
    headers,
    body: payload,
  });

  const json = await res.json() as TencentAsrResponse;
  const error = json.Response?.Error;
  if (!res.ok || error) {
    const message = error?.Message || `腾讯云 ASR 请求失败：HTTP ${res.status}`;
    throw new Error(message);
  }

  return (json.Response?.Result || '').trim();
}

function getVoiceFormat(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || 'mp3';
  if (ext === 'oga') return 'ogg-opus';
  if (['wav', 'pcm', 'ogg-opus', 'speex', 'silk', 'mp3', 'm4a', 'aac', 'amr'].includes(ext)) {
    return ext;
  }
  return 'mp3';
}

function buildTencentHeaders(params: {
  payload: string;
  timestamp: number;
  region: string;
  secretId: string;
  secretKey: string;
}): Record<string, string> {
  const { payload, timestamp, region, secretId, secretKey } = params;
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
  const contentType = 'application/json; charset=utf-8';
  const hashedPayload = sha256(payload);
  const canonicalHeaders = `content-type:${contentType}\nhost:${TENCENT_ASR_HOST}\n`;
  const signedHeaders = 'content-type;host';
  const canonicalRequest = [
    'POST',
    '/',
    '',
    canonicalHeaders,
    signedHeaders,
    hashedPayload,
  ].join('\n');

  const credentialScope = `${date}/${TENCENT_ASR_SERVICE}/tc3_request`;
  const stringToSign = [
    'TC3-HMAC-SHA256',
    String(timestamp),
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');

  const secretDate = hmac(`TC3${secretKey}`, date);
  const secretService = hmac(secretDate, TENCENT_ASR_SERVICE);
  const secretSigning = hmac(secretService, 'tc3_request');
  const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
  const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    Authorization: authorization,
    'Content-Type': contentType,
    Host: TENCENT_ASR_HOST,
    'X-TC-Action': TENCENT_ASR_ACTION,
    'X-TC-Version': TENCENT_ASR_VERSION,
    'X-TC-Timestamp': String(timestamp),
    'X-TC-Region': region,
  };
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmac(key: string | Buffer, value: string): Buffer {
  return crypto.createHmac('sha256', key).update(value).digest();
}
