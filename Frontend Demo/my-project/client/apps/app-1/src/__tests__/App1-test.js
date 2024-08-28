/**
 * Integration tests for <e-app-1>
 */
import { expect } from 'chai';
import App1 from '../App1';
import {
  inShadow,
  injectHTMLElement,
} from '../../../../../test/utils';

describe('App1 Application Tests', () => {
    let container;
    let inject;
    before(() => {
      container = document.body.appendChild(document.createElement('div'));
      inject = injectHTMLElement.bind(null, container);
      window.EUI = undefined; // stub out the locale
      App1.register();
    });

    after(() => {
      document.body.removeChild(container);
    });

    describe('Basic application setup', () => {
      it('should create a new <e-app-1>', async () => {
        const appUnderTest = await inject('<e-app-1></e-app-1>');
        // check shadow DOM
        const headingTag = inShadow(appUnderTest, 'h1');
        expect(headingTag.textContent, '"Your app markup goes here" was not found').to.equal('Your app markup goes here');
      });
    });
});
