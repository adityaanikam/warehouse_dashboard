// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// react-router v7 needs TextEncoder/TextDecoder, which the jsdom environment in
// Create React App's Jest 27 does not provide.
Object.assign(global, { TextEncoder, TextDecoder });
